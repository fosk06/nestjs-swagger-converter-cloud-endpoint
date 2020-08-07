import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import {convert}  from 'api-spec-converter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {writeFileSync} from 'fs'
import * as YAML from 'yaml'


export interface converterOptions {
  title: string; // title of  the API
  description: string; // description of the API
  version: string; // version of the API
  specFilePath: string; // file path to save the yaml
  host: string; // the host of the API
  domain: string; // the domain of the endpoint
  staticIp: string; // the static ip of cloud endpoint used in section "x-google-endpoints"
  securityName: string; // name of the securityDefinition for OAuth2
  authorizationUrl: string; // authaurization url
  googleIssuerUrl: string; // the cloud endpoint securetoken.google.com url to set "x-google-issuer" field
  googleJwksUri: string; // the google-jwks_uri to set "x-google-jwks_uri" field
  googleAudiences: string; // the google-audiences to set "x-google-audiences" field
}

/** Buil the spec with swagger module
 */
function buildOpenAPIDocument(options) {
    const document = new DocumentBuilder()
    .setTitle(options.title)
    .setDescription(options.description)
    .setVersion(options.version)
    .addOAuth2({
      type: 'oauth2',
      flows :{
        implicit: {
          authorizationUrl: options.authorizationUrl || '',
          scopes: {} // required for TS
        }
      }
    },options.securityName)
    .addServer('https:///') // this weird thing will set "schemes = https" and basePath = "/"
    .build();
    return document;
}

/** 
 * Build the NestJS app for supertest
 */
async function buildSwaggerObjectV3(AppModule, options): Promise<any> {
    let app: INestApplication;
    const openAPIoptions = buildOpenAPIDocument(options)
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    })
    .compile();
    
    app = moduleFixture.createNestApplication();
    const swaggerObject = SwaggerModule.createDocument(app, openAPIoptions);
    return {swaggerObject, options}
}

/** add the security parameters for GCP cloud endpoints
 * @param  {} swaggerObject the js object swagger spec
 */
async function addGCPSecurity({swaggerObject, options}) {
  try {
    const securityName = options.securityName
    swaggerObject.securityDefinitions[securityName]['x-google-issuer'] = options.googleIssuerUrl;
    swaggerObject.securityDefinitions[securityName]['x-google-jwks_uri'] = options.googleJwksUri;
    swaggerObject.securityDefinitions[securityName]['x-google-audiences'] = options.googleAudiences;
  } catch (error) {}
  return {swaggerObject, options}
}

/** add the cloud endpoints for GCP
 * @param  {} swaggerObject the js object swagger spec
 */
async function addGoogleEndpoints({swaggerObject, options}) {
  swaggerObject['x-google-endpoints'] = [
    {
      "name": options.domain,
      "target": options.staticIp
    }
  ]
  return {swaggerObject, options}
}

/** setHost method has been removed from swagger module, must do it by ourselves
 * @param  {} swaggerObject
 */
async function setHost({swaggerObject, options}) {
  swaggerObject['host'] = options.host
  return {swaggerObject, options}
}

async function writeSwaggerFile({swaggerObject, options}) {
  const fileYaml = YAML.stringify(swaggerObject)
  writeFileSync(options.specFilePath, fileYaml)
  console.log(`swagger V2 file saved at ${options.specFilePath}`);
  return {swaggerObject,options};
}

/**
 * @param  {} app  the nestJS app instance
 * @param  {string} specFilePath the path to save the spec file
 */
export async function convertOpenAPIV3toV2(rootModule, options:converterOptions) {
    
    return buildSwaggerObjectV3(rootModule, options)
    .then(({swaggerObject}) => {
      return convert({
        from: 'openapi_3',
        to: 'swagger_2',
        source: swaggerObject
      })
    })
    .then(converted => {
      const swaggerObject = converted.spec
      return {swaggerObject, options}
    })
    .then(setHost)
    .then(addGoogleEndpoints)
    .then(addGCPSecurity)
    .then(writeSwaggerFile)
}