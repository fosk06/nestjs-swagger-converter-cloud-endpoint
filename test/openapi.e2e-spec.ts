import { convertOpenAPIV3toV2, converterOptions, formatOptions } from "../lib/index"
import {swaggerDocument} from './swager3'


describe('Test spec generation', function() {

    it(`spec object is correct`, async () => {
      const options: converterOptions = {
        format: formatOptions.json,
        applicationName: `api`,
        host: 'myHost',
        endpointTargetIp: '127.0.0.1',
        securityName: 'firebaseShop',
        googleIssuerUrl: 'https://securetoken.google.com/supershop',
        googleJwksUri: 'https://www.googleapis.com/service_accounts/v1/metadata/x509/securetoken@system.gserviceaccount.com',
        googleAudiences: 'supershop'
      }
      const {swaggerObject} = await convertOpenAPIV3toV2(swaggerDocument,options)
      
      // check regular swagger 2 fields
      expect(swaggerObject.swagger).toBe("2.0");
      expect(swaggerObject.host).toBe(options.host);
      expect(swaggerObject.basePath).toBe("/");
      expect(swaggerObject.schemes[0]).toBe("https");
      
      // // check security sections
      expect(swaggerObject.securityDefinitions[options.securityName]).toBeDefined();
      expect(swaggerObject.securityDefinitions[options.securityName].type).toBe('oauth2'); 
      expect(swaggerObject.securityDefinitions[options.securityName].flow).toBe('implicit'); 
      expect(swaggerObject.securityDefinitions[options.securityName].authorizationUrl).toBe(''); 
      expect(swaggerObject.securityDefinitions[options.securityName]['x-google-issuer']).toBe(options.googleIssuerUrl); 
      expect(swaggerObject.securityDefinitions[options.securityName]['x-google-jwks_uri']).toBe(options.googleJwksUri); 
      expect(swaggerObject.securityDefinitions[options.securityName]['x-google-audiences']).toBe(options.googleAudiences); 
      
      // // check gcp endpoint
      expect(swaggerObject['x-google-endpoints']).toContainEqual({name: options.host, target: options.endpointTargetIp})

    });
})
