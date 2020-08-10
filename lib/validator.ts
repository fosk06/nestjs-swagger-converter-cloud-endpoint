import { ValidateNested, IsDefined, IsString, IsOptional, IsObject } from 'class-validator';

export interface Info {
    title: string;
    description: string;
    version: string;
    contact: any;
}

export interface Server {
    url: string;
}

export class SwaggerObject {

    @IsDefined()
    swagger: string;
    
    @ValidateNested()
    info: Info;

    @IsOptional()
    tags: string[];

    @ValidateNested()
    servers: Server[];

    @IsDefined()
    @IsObject()
    paths: any;
    
    @IsOptional()
    @IsObject()
    components?: any
}

