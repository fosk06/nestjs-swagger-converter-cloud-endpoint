import { convertOpenAPIV3toV2, converterOptions, formatOptions } from "../lib/index"
import {swaggerDocument} from './swager3'

describe('Test spec generation', function() {

    const options: converterOptions = {
      gcpProject: 'my-gcp-project',
      folderPath: process.cwd(),
      format: formatOptions.json,
      applicationName: `api`,
      host: 'myHost',
      endpointTargetIp: '127.0.0.1',
      securityName: 'firebaseShop'
    }

    it(`spec object is correct`, async () => {
      const {swaggerObject} = await convertOpenAPIV3toV2(swaggerDocument,options)
      // // check regular swagger 2 fields
      expect(swaggerObject.swagger).toBe("2.0");
      expect(swaggerObject.host).toBe(options.host);
      expect(swaggerObject.basePath).toBe("/");
      expect(swaggerObject.schemes[0]).toBe("https");
      
      // check security sections
      expect(swaggerObject.securityDefinitions[options.securityName]).toBeDefined();
      expect(swaggerObject.securityDefinitions[options.securityName].type).toBe('oauth2'); 
      expect(swaggerObject.securityDefinitions[options.securityName].flow).toBe('implicit'); 
      expect(swaggerObject.securityDefinitions[options.securityName].authorizationUrl).toBe(''); 
      expect(swaggerObject.securityDefinitions[options.securityName]['x-google-issuer']).toBe(`https://securetoken.google.com/${options.gcpProject}`); 
      expect(swaggerObject.securityDefinitions[options.securityName]['x-google-jwks_uri']).toBe(`https://www.googleapis.com/service_accounts/v1/metadata/x509/securetoken@system.gserviceaccount.com`); 
      expect(swaggerObject.securityDefinitions[options.securityName]['x-google-audiences']).toBe(options.gcpProject); 
      
      // check gcp endpoint
      expect(swaggerObject['x-google-endpoints']).toContainEqual({name: options.host, target: options.endpointTargetIp})
    });

    it(`spec validation failed with incorrect V3 spec`, async () => {
      const doc:any = {
        ...swaggerDocument
      }
      delete doc.servers // remove servers field
      expect(convertOpenAPIV3toV2(doc,options)).rejects.toEqual(new Error(`"host" is required,"basePath" is required`))
      expect(true).toBe(true);
    })
})
