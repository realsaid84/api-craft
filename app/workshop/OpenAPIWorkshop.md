# OpenAPI 3.0 Workshop: Building a Food Delivery API

## Overview

In this workshop, we'll explore how the OpenAPI 3.0 specification can simplify API design, documentation, and collaboration. Imagine you're building an API for a food delivery system similar to Uber Eats. You'll learn how to define routes, schemas, authentication, and more to create a well-documented and consumable API.

By the end of this workshop, you'll understand how to create APIs that are consistent, scalable, and easy to consume, all while leveraging OpenAPI to simplify communication between teams.

## Workshop Details

- **Duration:** 1 hour
- **Target Audience:** Technical Writers
- **Prerequisites:** Basic API Knowledge

---

## Module 1: Getting Started

### Exercise 1.1: Setting Up Your Environment

Prepare your development environment with the necessary tools:

1. Create a new directory named `food-delivery-api-docs`.
2. Create a new file `food-delivery-api.yaml`.
3. Install recommended VS Code extensions:
   - Open VS Code Extensions panel (Ctrl+Shift+X or Cmd+Shift+X).
   - Search and install "OpenAPI (Swagger) Editor".
   - Search and install "Elemental Preview".
   - Search and install "YAML" by Red Hat.
   - Search and install "Spectral" plugin.
   - Reload VS Code if prompted.

### Exercise 1.2: Basic Document Structure

Start with the basic OpenAPI structure:

```yaml
openapi: 3.0.3
info:
  title: Food Delivery API
  version: 1.0.0
```

Add expanded API information:

```yaml
info:
  title: Food Delivery API
  version: 1.0.0
  description: |
    # Food Delivery API

    This API allows customers to browse restaurants, place orders, and track deliveries in real-time.

    Features include:
    - Restaurant Listings
    - Menu Browsing
    - Order Placement
    - Delivery Tracking
  contact:
    name: Food Delivery Support
    email: support@fooddelivery.example.com
```

### Exercise 1.3: Introducing Tags

Tags help organize API features:

```yaml
tags:
  - name: Restaurants
    description: Operations related to restaurant listings
  - name: Menu
    description: Operations for browsing and managing menus
  - name: Orders
    description: Order placement and management
  - name: Delivery
    description: Delivery tracking and updates
```

### Exercise 1.4: Define Servers

Define the server URLs of the different API environments:

```yaml
servers:
  - url: https://api.fooddelivery.example.com/v1
    description: Production server
  - url: https://staging.api.fooddelivery.example.com/v1
    description: Staging server
```

### Exercise 1.5: Introducing Security

Define the security scheme (we are designing for bearer token authentication):

```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
```

Apply the pre-defined security scheme to the API globally:

```yaml
security: # Apply globally
  - BearerAuth: []
```

---

## Module 2: Component Schemas

Information modeling involves defining and structuring data to represent real-world entities and their relationships within a system.

Creating API models is a fundamental aspect of API design; this process includes creating schemas that specify the structure, types, and constraints of the data exchange. These schemas serve as blueprints (a clear contract for API interactions), ensuring consistency, reliability, and ease of maintenance in API interactions.

In this module, we will focus on modeling the schemas for the food delivery API, detailing its attributes and relationships to other entities. This exercise will provide practical experience in creating API schemas, reinforcing the importance of clear data modeling in API development.

### Exercise 2.1: Restaurant Schema

Define the Restaurant schema:

```yaml
components:
  schemas:
    Restaurant:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: "abc123"
        name:
          type: string
          example: "The Great Grill"
        address:
          type: string
          example: "123 Main Street, Cityville"
        rating:
          type: number
          format: float
          example: 4.5
      required:
        - name
```

### Exercise 2.2: Menu Schema

Define the Menu and MenuItem schema:

```yaml
components:
  schemas:
    MenuItem:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: 123e4567-e89b-12d3-a456-426614174000
        name:
          type: string
          example: Tuna Steak
        price:
          type: number
          format: float
          example: 50.36
        description:
          type: string
          example: Tuna Steak Menu item
    Menu:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: "menu123"
        restaurantId:
          type: string
          format: uuid
          example: "abc123"
        items:
          type: array
          items:
            $ref: '#/components/schemas/MenuItem'
    Restaurant:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: "abc123"
        name:
          type: string
          example: "The Great Grill"
        address:
          type: string
          example: "123 Main Street, Cityville"
        rating:
          type: number
          format: float
          example: 4.5
      required:
        - name
```

### Exercise 2.3: Order Schema

Define the Order schema:

```yaml
components:
  schemas:
    Order:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: "order123"
        customerId:
          type: string
          example: "cust123"
        items:
          type: array
          items:
            $ref: '#/components/schemas/MenuItem'
        totalAmount:
          type: number
          format: float
          example: 25.50
    MenuItem:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: 123e4567-e89b-12d3-a456-426614174000
        name:
          type: string
          example: Tuna Steak
        price:
          type: number
          format: float
          example: 50.36
        description:
          type: string
          example: Tuna Steak Menu item
    Menu:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: "menu123"
        restaurantId:
          type: string
          format: uuid
          example: "abc123"
        items:
          type: array
          items:
            $ref: '#/components/schemas/MenuItem'
    Restaurant:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: "abc123"
        name:
          type: string
          example: "The Great Grill"
        address:
          type: string
          example: "123 Main Street, Cityville"
        rating:
          type: number
          format: float
          example: 4.5
      required:
        - name
```

### Exercise 2.4: Delivery Schema

Define the Delivery schema:

```yaml
components:
  schemas:
    Delivery:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: "del123"
        orderId:
          type: string
          format: uuid
          example: "order123"
        status:
          type: string
          enum: [Pending, Out for Delivery, Delivered]
          example: "Out for Delivery"
        eta:
          type: string
          format: date-time
          example: "2025-01-15T18:30:00Z"
    Order:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: "order123"
        customerId:
          type: string
          example: "cust123"
        items:
          type: array
          items:
            $ref: '#/components/schemas/MenuItem'
        totalAmount:
          type: number
          format: float
          example: 25.50
    MenuItem:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: 123e4567-e89b-12d3-a456-426614174000
        name:
          type: string
          example: Tuna Steak
        price:
          type: number
          format: float
          example: 50.36
        description:
          type: string
          example: Tuna Steak Menu item
    Menu:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: "menu123"
        restaurantId:
          type: string
          format: uuid
          example: "abc123"
        items:
          type: array
          items:
            $ref: '#/components/schemas/MenuItem'
    Restaurant:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: "abc123"
        name:
          type: string
          example: "The Great Grill"
        address:
          type: string
          example: "123 Main Street, Cityville"
        rating:
          type: number
          format: float
          example: 4.5
      required:
        - name

```

---

## Module 3: Request and Response Modeling

**Duration:** 20 minutes

### Exercise 3.1: Create Restaurant Request

Define the request body for creating a restaurant:

1. **Task:** Create a new example for the request in the components section:

   ```yaml
   components:
     examples:
       RestaurantRequestExample:
         summary: Example of a restaurant creation request
         value:
           name: "The Great Grill"
           address: "123 Main Street, Cityville"
           rating: 4.5
   ```

2. **Task:** Describe the API operations starting with the `paths` statement:

   ```yaml
   paths:
   ```

3. **Task:** Describe the POST `/restaurants` operation and reference this example in the `requestBody`:

   ```yaml
   paths:
     /restaurants:
       post:
         tags:
           - Restaurants
         summary: Add a new restaurant
         operationId: addRestaurant
         requestBody:
           required: true
           content:
             application/json:
               schema:
                 $ref: '#/components/schemas/Restaurant'
               examples:
                 restaurantExample:
                   $ref: '#/components/examples/RestaurantRequestExample'
   ```

### Exercise 3.2: Get Restaurant Response

Define the response for fetching restaurant details:

1. **Task:** Create a new example for the response in the components section:

   ```yaml
   components:
     examples:
       RestaurantResponseExample:
         summary: Example of a restaurant response
         value:
           id: "123e4567-e89b-12d3-a456-426614174254"
           name: "The Great Grill"
           address: "123 Main Street, Cityville"
           rating: 4.5
   ```

2. **Task:** Reference this example in the GET `/restaurants/{id}` response:

   ```yaml
   paths:
     /restaurants/{id}:
       get:
         tags:
           - Restaurants
         summary: Get restaurant details
         operationId: getRestaurant
         parameters:
           - name: id
             in: path
             required: true
             schema:
               type: string
               format: uuid
         responses:
           '200':
             description: Restaurant details
             content:
               application/json:
                 schema:
                   $ref: '#/components/schemas/Restaurant'
                 examples:
                   restaurantExample:
                     $ref: '#/components/examples/RestaurantResponseExample'
   ```

---

## Module 4: Add Event Subscription Operation and Callback

**Duration:** 5 minutes

### Exercise 4.1: Define API Event Subscription Operation

Define event subscriptions to describe asynchronous operations where the Food Delivery API sends event notifications to the client:

1. **Task:** Define a `subscriptions` operation:

   ```yaml
   paths:
     /subscriptions:
       post:
         summary: Register for updates
         operationId: registerUpdates
         description: Client subscribes to the Food Delivery webhook to receive updates
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
                     example: https://webhookreceiver.example.com/events
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
   ```

### Exercise 4.2: Add an Event Callback for the Subscriptions

Define the event callback emanating from the API to the subscriber's callback URL:

1. **Task:** Define a callback to send notifications to the subscriber's callback URL when an event occurs:

   ```yaml
   paths:
     /subscriptions:
       post:
         summary: Register for updates
         operationId: registerUpdates
         description: Client subscribes to the Food Delivery webhook to receive updates
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
                     example: https://webhookreceiver.example.com/events
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
                             example: "order.updated"
                           data:
                             type: object
                 responses:
                   '204':
                     description: Callback received successfully
   ```

**Note:** Ensure that the `callbackUrl` provided by the client is network-accessible by the source server, as specified in the OpenAPI documentation. 


---

# Wrapping it up

**Duration:** 5 minutes

## What Good Looks Like

Here's a complete example of a well-defined OpenAPI 3.0 specification:

```yaml
openapi: 3.0.3
info:
  title: Food Delivery API
  version: 1.0.0
  description: This API allows customers to browse restaurants, place orders, and track deliveries.
  contact:
    name: API Support
    email: support@fooddelivery.example.com
servers:
  - url: https://api.fooddelivery.example.com/v1
    description: Production server
  - url: https://staging.api.fooddelivery.example.com/v1
    description: Staging server
tags:
  - name: Restaurants
    description: Operations related to restaurant listings
  - name: Menu
    description: Operations for browsing and managing menus
  - name: Orders
    description: Order placement and management
  - name: Delivery
    description: Delivery tracking and updates
security:
  - BearerAuth: []
paths:
  /restaurants:
    post:
      tags:
        - Restaurants
      summary: Add a new restaurant
      operationId: addRestaurant
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Restaurant'
      responses:
        '201':
          description: Restaurant created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Restaurant'
  /restaurants/{id}:
    get:
      tags:
        - Restaurants
      summary: Get restaurant details
      operationId: getRestaurant
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Restaurant details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Restaurant'
  /orders:
    post:
      tags:
        - Orders
      summary: Place an order
      operationId: placeOrder
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Order'
      responses:
        '201':
          description: Order placed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OrderResponse'
  /subscriptions:
    post:
      summary: Register for updates
      operationId: registerUpdates
      description: Client subscribes to the Food Delivery webhook to receive updates
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
                  example: https://webhookreceiver.example.com/events
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
                          example: "order.updated"
                        data:
                          type: object
              responses:
                '204':
                  description: Callback received successfully
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
  examples:
    RestaurantRequestExample:
      summary: Example of a restaurant creation request
      value:
        name: "The Great Grill"
        address: "123 Main Street, Cityville"
        rating: 4.5
    RestaurantResponseExample:
      summary: Example of a restaurant response
      value:
        id: "123e4567-e89b-12d3-a456-426614174254"
        name: "The Great Grill"
        address: "123 Main Street, Cityville"
        rating: 4.5
  schemas:
    Restaurant:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: 123e4567-e89b-12d3-a456-426614174000
        name:
          type: string
        address:
          type: string
        rating:
          type: number
          format: float
      required:
        - name
    MenuItem:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: 123e4567-e89b-12d3-a456-426614174000
        name:
          type: string
          example: Tuna Steak
        price:
          type: number
          format: float
          example: 50.36
        description:
          type: string
          example: Tuna Steak Menu item
    Order:
      type: object
      properties:
        id:
          type: string
          format: uuid
        customerId:
          type: string
        items:
          type: array
          items:
            $ref: '#/components/schemas/MenuItem'
        totalAmount:
          type: number
          format: float
    OrderResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        status:
          type: string
          example: "Pending"
        eta:
          type: string
          format: date-time
```

## Workshop Completion Checklist

- [ ] Basic document structure complete
- [ ] Servers defined
- [ ] Components created
- [ ] Endpoints documented
- [ ] Security configured
- [ ] Examples added
