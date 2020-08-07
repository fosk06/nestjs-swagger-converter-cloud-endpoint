import { resolve } from 'path'
import { AppModule } from './sample/src/app.module';
import { convertOpenAPIV3toV2, converterOptions } from '../lib/index';

describe('Tests OPEN api spec generation', () => {

  describe('Test spec generation', function() {
      it(`spec is present on file system`, async () => {
        const options: converterOptions = {
          title: 'Segment io HTTP proxy',
          description:'Segment io HTTP proxy',
          version: '0.1.0',
          specFilePath: `${process.cwd()}/swagger.yaml`,
          host: 'myHost',
          domain: 'myDomain',
          staticIp: '127.0.0.1',
          securityName: 'firebaseShop',
          authorizationUrl: '',
          googleIssuerUrl: 'https://securetoken.google.com/supershop',
          googleJwksUri: 'https://www.googleapis.com/service_accounts/v1/metadata/x509/securetoken@system.gserviceaccount.com',
          googleAudiences: 'supershop'
        }
        const {swaggerObject} = await convertOpenAPIV3toV2(AppModule,options)
        
        // check regular swagger 2 fields
        expect(swaggerObject.swagger).toBe("2.0");
        expect(swaggerObject.host).toBe(options.host);
        expect(swaggerObject.basePath).toBe("/");
        expect(swaggerObject.schemes[0]).toBe("https");
        
        // check security sections
        expect(swaggerObject.securityDefinitions[options.securityName]).toBeDefined();
        expect(swaggerObject.securityDefinitions[options.securityName].authorizationUrl).toBe(options.authorizationUrl); 
        expect(swaggerObject.securityDefinitions[options.securityName]['x-google-issuer']).toBe(options.googleIssuerUrl); 
        expect(swaggerObject.securityDefinitions[options.securityName]['x-google-jwks_uri']).toBe(options.googleJwksUri); 
        expect(swaggerObject.securityDefinitions[options.securityName]['x-google-audiences']).toBe(options.googleAudiences); 
        
        // check gcp endpoint
        expect(swaggerObject['x-google-endpoints']).toContainEqual({name: options.domain, target: options.staticIp})

      });
  })

});
