import {convert}  from 'api-spec-converter';
import {writeFileSync} from 'fs'
import * as YAML from 'yaml'


export enum formatOptions {
  json = "json",
  yaml = "yaml"
};

export interface converterOptions {
  format: formatOptions
  applicationName: string; // file path to save the yaml
  host: string; // the host of the API
  endpointTargetIp: string; // the static ip of cloud endpoint used in section "x-google-endpoints"
  securityName: string; // name of the securityDefinition for OAuth2
  googleIssuerUrl: string; // the cloud endpoint securetoken.google.com url to set "x-google-issuer" field
  googleJwksUri: string; // the google-jwks_uri to set "x-google-jwks_uri" field
  googleAudiences: string; // the google-audiences to set "x-google-audiences" field
}

/** add the security parameters for GCP cloud endpoints
 * @param  {} swaggerObject the js object swagger spec
 */
async function addGCPSecurity({swaggerObject, options}) {
  try {
    const securityName = options.securityName
    if(!swaggerObject.securityDefinitions) {
      swaggerObject.securityDefinitions = {}
    }
    swaggerObject.securityDefinitions[securityName] = {}
    swaggerObject.securityDefinitions[securityName]['type'] = 'oauth2'
    swaggerObject.securityDefinitions[securityName]['flow'] = 'implicit'
    swaggerObject.securityDefinitions[securityName]['authorizationUrl'] = ''
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
      "name": options.host,
      "target": options.endpointTargetIp
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
  if(options.format === 'json') {
    writeFileSync(`${process.cwd()}/${options.applicationName}.json`, JSON.stringify(swaggerObject))
  }
  if(options.format === 'yaml') {
    writeFileSync(`${process.cwd()}/${options.applicationName}.yaml`, fileYaml)
  }
  return {swaggerObject,options};
}

/**
 * @param  {} swaggerObjectV3  the v3 swagger object
 * @param  {string} applicationName the path to save the spec file
 */
export async function convertOpenAPIV3toV2(swaggerObjectV3, options:converterOptions) {
    return convert({
      from: 'openapi_3',
      to: 'swagger_2',
      source: swaggerObjectV3
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