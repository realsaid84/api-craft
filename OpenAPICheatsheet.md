# OpenAPI 3.0 Cheatsheet

## Document Structure

An OpenAPI document is a JSON or YAML file containing these root elements:

```yaml
openapi: 3.0.x
info: {}
servers: []
security: []
tags: []
paths: {}
components: {}
```

- `openapi`: The OpenAPI version.
- `info`: API and document information.
- `servers`: List of available servers.
- `security`: Authentication description.
- `tags`: Define grouping tags.
- `paths`: List of endpoints.
- `components`: Reusable components.

## General Information

Define general information about your API:

```yaml
info:
  title: Your Awesome API
  version: 1.0.0
  description: What our API does...

servers:
  - url: https://example.org/api
    description: Production
  - url: https://test.api.example.com
    description: Test
```

## Security

Define security schemes and apply them globally or to specific operations:

### Define Security Schemes

```yaml
components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-KEY
    BearerAuth:
      type: http
      scheme: bearer
```

### Apply Security Schemes Globally

```yaml
security:
  - BearerAuth: []
```

### Apply Security Schemes to Specific Operations

```yaml
paths:
  /things:
    get:
      security:
        - ApiKeyAuth: []
```

### Allowed Types

- `apiKey` (in: header, query, or cookie)
- `http` (basic or bearer)
- `oauth2`

## Grouping and Sorting

Use `tags` to group related API operations, enhancing organization and readability:

### Define Tags Globally

```yaml
tags:
  - name: Things
    description: Operations related to Things
```

### Assign Tags to Operations

```yaml
paths:
  /things:
    get:
      tags:
        - Things
```

## API Structure

Describe operations with the `paths` statement:

```yaml
paths:
  /things:
    post:
      operationId: createThing
      summary: Create a new Thing
      description: Detailed **description** in CommonMark
      requestBody:
        description: Input data for the new Thing
        required: true
        content:
          application/json:
            schema:
              # Schema Object
      responses:
        '201':
          description: Successfully created
          content:
            application/json:
              schema:
                # Schema Object
```

## Data Types and Schemas

### Basic Types

- `null`: JSON "null" value
- `boolean`: JSON true or false value
- `object`: JSON object
- `array`: Ordered list of instances
- `integer`: Integer
- `number`: Base-10 decimal number
- `string`: String of Unicode code points

### Example Schema

```yaml
type: object
properties:
  id:
    type: string
    format: uuid
  password:
    type: string
    writeOnly: true
  name:
    type: string
    example: Bert
```

## Callbacks

Define callbacks to describe asynchronous operations where the API server sends a request back to the client:

```yaml
paths:
  /subscribe:
    post:
      summary: Register for updates
      description: Client subscribes to a webhook to receive updates
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                callbackUrl:
                  type: string
                  format: uri
                  description: URL for receiving updates
      responses:
        '201':
          description: Subscription created
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                    format: uuid
      callbacks:
        onEvent:
          '{$request.body#/callbackUrl}':
            post:
              summary: Callback when an event occurs
              requestBody:
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        event:
                          type: string
                          example: "item.updated"
                        data:
                          type: object
              responses:
                '204':
                  description: Callback received successfully
```

## Reuse Elements

Define reusable components and reference them using `$ref`:

### Define Reusable Components

```yaml
components:
  schemas:
    Thing:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
  responses:
    NotFound:
      description: Entity not found
  requestBodies:
    ThingInput:
      description: Thing input data
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Thing'
```

### Use Components with `$ref`

```yaml
paths:
  /things/{id}:
    get:
      responses:
        '404':
          $ref: '#/components/responses/NotFound'
```

## Polymorphism

Combine schemas using polymorphism statements:

- `oneOf`: Exactly one of the schemas (XOR)
- `anyOf`: One or more of the schemas (OR)
- `allOf`: All the schemas (AND)

### `oneOf`

```yaml
schema:
  oneOf:
    - $ref: '#/components/schemas/Dog'
    - $ref: '#/components/schemas/Cat'
  discriminator:
    propertyName: pet_type
```

### `anyOf`

```yaml
schema:
  anyOf:
    - $ref: '#/components/schemas/PetMetadata'
    - $ref: '#/components/schemas/PetType'
```

### `allOf`

```yaml
schema:
  allOf:
    - $ref: '#/components/schemas/PetMetadata'
    - $ref: '#/components/schemas/PetType'
```

This cheatsheet provides a concise overview of the OpenAPI 3.0 Specification, aiding in the design and documentation of APIs. For more detailed information, refer to the [OpenAPI Specification](https://swagger.io/specification/).  