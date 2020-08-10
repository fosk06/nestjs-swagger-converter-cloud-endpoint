export const swaggerDocument = {
    "openapi": "3.0.0",
    "info": {
        "title": "HTTP api",
        "description": "HTTP api",
        "version": "1.0",
        "contact": {}
    },
    "tags": [],
    "servers": [
        {
            "url": "https://localhost:3000"
        }
    ],
    "components": {
        "schemas": {
            "TrackDto": {
                "type": "object",
                "properties": {
                    "shopId": {
                        "type": "string"
                    },
                    "anonymousId": {
                        "type": "string"
                    },
                    "context": {
                        "type": "object"
                    },
                    "event": {
                        "type": "string"
                    },
                    "integrations": {
                        "type": "object"
                    },
                    "properties": {
                        "type": "object"
                    },
                    "timestamp": {
                        "type": "string"
                    },
                    "userId": {
                        "type": "string"
                    }
                },
                "required": [
                    "event"
                ]
            },
        }
    },
    "paths": {
        "/v1/track": {
            "post": {
                "operationId": "TrackController_root",
                "parameters": [],
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/TrackDto"
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Ok"
                    },
                    "201": {
                        "description": "",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Bad request"
                    }
                },
                "tags": [
                    "track"
                ],
                "security": [
                    {
                        "bearer": []
                    }
                ]
            }
        }
    }
}