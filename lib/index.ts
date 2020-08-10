import {convert}  from 'api-spec-converter';
import {writeFileSync} from 'fs'
import * as YAML from 'yaml'
import { schema } from "./validator";


export enum formatOptions {
  json = "json",
  yaml = "yaml"
};

export interface converterOptions {
  format: formatOptions;
  gcpProject: string;
  applicationName: string; // file path to save the yaml
  folderPath:string; // the folder where to write file
  host: string; // the host of the API
  endpointTargetIp: string; // the static ip of cloud endpoint used in section "x-google-endpoints"
  securityName: string; // name of the securityDefinition for OAuth2
  authorizationUrl?: string; // authorizationUrl for oauth 2
}

/** add the security parameters for GCP cloud endpoints
 * @param  {} swaggerObject the js object swagger spec
 */
async function addGCPSecurity({swaggerObject, options}) {
  try {
    const securityName = options.securityName
    if(!!swaggerObject.securityDefinitions === false) { // securityDefinitions not defined
      swaggerObject.securityDefinitions = {}
    }
    swaggerObject.securityDefinitions[securityName] = {}
    swaggerObject.securityDefinitions[securityName]['type'] = 'oauth2'
    swaggerObject.securityDefinitions[securityName]['flow'] = 'implicit'
    swaggerObject.securityDefinitions[securityName]['authorizationUrl'] = options.authorizationUrl || '';
    swaggerObject.securityDefinitions[securityName]['x-google-issuer'] = `https://securetoken.google.com/${options.gcpProject}`
    swaggerObject.securityDefinitions[securityName]['x-google-jwks_uri'] = `https://www.googleapis.com/service_accounts/v1/metadata/x509/securetoken@system.gserviceaccount.com`;
    swaggerObject.securityDefinitions[securityName]['x-google-audiences'] = options.gcpProject;
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
    writeFileSync(`${options.folderPath}/${options.applicationName}.json`, JSON.stringify(swaggerObject))
  }
  if(options.format === 'yaml') {
    writeFileSync(`${options.folderPath}/${options.applicationName}.yaml`, fileYaml)
  }
  return {swaggerObject,options};
}

export async function validateSwaggerObject({swaggerObject, options}) {
  const res = schema.validate(swaggerObject, {allowUnknown: true, abortEarly:false})
  if(res.error) {
    let message = 'validation error'
    if(res.error.details) {
      message = res.error.details.map(i => i.message).join(',')
    }
    throw new Error(message)
  } else {
    return {swaggerObject, options}
  }
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
    .then(validateSwaggerObject)
    .then(setHost)
    .then(addGoogleEndpoints)
    .then(addGCPSecurity)
    .then(writeSwaggerFile)
}