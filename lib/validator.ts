import * as Joi from 'joi';


export const schema = Joi.object({
    "swagger": Joi.string().valid('2.0').required(),
    "info": {
        "title": Joi.string().required(),
        "description": Joi.string().required(),
        "version": Joi.string().required(),
        "contact": Joi.any().optional()
    },
    "host": Joi.string().required(),
    "basePath": Joi.string().required(),
    "tags": Joi.array().items(Joi.string()),
    "definitions": Joi.any(),
    "paths": Joi.object().required()

});