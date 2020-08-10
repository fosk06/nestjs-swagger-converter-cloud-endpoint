# nestjs-swager-converter-cloud-endpoint

Convert OpenAPI V3 to Swagger 2 file compatible with GCP cloud endpoint

## How to use

This package is only for [NestJS](https://docs.nestjs.com/) applications.  
You will need to use it with the "@nestjs/swagger" module, following this [documentation](https://docs.nestjs.com/openapi/introduction).  

```js
// in your main.ts
import { convertOpenAPIV3toV2, converterOptions, formatOptions } from "nestjs-swagger-converter-cloud-endpoint";

const convertionOptions: converterOptions = {
    format: formatOptions.yaml, // or formatOptions.json to write as json file
    gcpProject: 'my_gcp_project', // name of your GCP project
    folderPath: process.cwd(), // the folder path to write the spec
    applicationName: `my_application`,
    host: `${GCP_ENDPOINT_HOST}`, // the GCP endpoint hostname
    endpointTargetIp: `${GCP_ENDPOINT_TARGET_IP}`, // the GCP endpoint public ip
    securityName: 'my_security_name', // the name of the security section in the spec
    // authorizationUrl: '' if you want to manually set the oauth2 authorizationUrl
}

// build you swagger doc like described in the nestjs documentation
const swaggerDocument = new DocumentBuilder()
        .setTitle('my super API')
        .setDescription('my super API')
        .setVersion('1.0.0')
        .addServer('https://localhost:3000', 'local server') // mandatory or it would fail
        .build();

const document = SwaggerModule.createDocument(app, swaggerDocument);

// call the module with the document instance, it will write it to process.cwd()/my_application.yaml
await convertOpenAPIV3toV2(document, convertionOptions)

```
