'use client';

import React, { useState } from 'react';
import { BookOpen, Database, Route, GraduationCap, Clock, Users, CheckCircle, Code, FileText, ChevronDown, ChevronRight, Rocket, LucideIcon} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ModuleProps {
  icon: LucideIcon;
  title: string;
  duration: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

interface BlockProps {
  children: React.ReactNode;
}

interface CodeBlockProps {
  children: React.ReactNode;
  language?: string;
}

interface ExcerciseProps {
  title: string;
  children: React.ReactNode;
}

const Module = ({ title, duration, icon: Icon, children, defaultOpen = false }: ModuleProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <Card className="mb-6">
      <CardHeader 
        className="cursor-pointer flex flex-row items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-blue-600" />
          <CardTitle className="text-xl">{title}</CardTitle>
          <span className="flex items-center text-sm text-gray-500 ml-4">
            <Clock className="w-4 h-4 mr-1" />
            {duration}
          </span>
        </div>
        {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </CardHeader>
      {isOpen && <CardContent>{children}</CardContent>}
    </Card>
  );
};

const Exercise = ({ title, children }: ExcerciseProps) => (
  <div className="mt-4 mb-6">
    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
      <Code className="w-5 h-5 text-blue-600" />
      {title}
    </h3>
    {children}
  </div>
);

const CodeBlock = ({ children, language = 'yaml' }: CodeBlockProps) => {
  // Ensure children is a string
  const codeString = typeof children === 'string' ? children : String(children);

  return (
    <div className="rounded-md overflow-hidden">
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem', // text-sm
          borderRadius: '0.375rem', // rounded-md
        }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
};


const Task = ({ children }: BlockProps) => (
  <div className="flex items-start gap-2 mt-2">
    <div className="mt-1">
      <CheckCircle className="w-4 h-4 text-green-600" />
    </div>
    <div>{children}</div>
  </div>
);

export  const OpenAPIWorkshop = () => {
  return (
    <div className="max-w-5xl mx-auto p-8 bg-white">
      <div className="mb-12">
        <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold mb-4">OpenAPI 3.0 Workshop</h1>
          <Link href="../learn/openapi-cheatsheet" className="no-underline">
            <Button className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Return to the Cheatsheet
            </Button>
        </Link>
      </div>
        <p className="text-xl text-gray-600">Building a Food Delivery API</p>
        <h2 className="text-2xl font-semibold mt-6">Use Case: Modern Food Delivery System</h2>
        <p className="mt-4 text-lg text-gray-700">
          This workshop explores how the OpenAPI 3.0 specification can simplify API design, documentation, and collaboration.
          Imagine you are building an API for a food delivery system similar to Uber Eats. You will learn how to define routes, schemas, 
          authentication, and more to create a well-documented and consumable API.
        </p>
        <p className="mt-4 text-lg text-gray-700">
          By the end of this workshop, you will understand how to create APIs that are consistent, scalable, and easy to consume, 
          all while leveraging OpenAPI to simplify communication between teams.
        </p>
        
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Duration</h3>
                  <p className="text-gray-600">1 hour</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Target Audience</h3>
                  <p className="text-gray-600">Technical Writers</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Prerequisites</h3>
                  <p className="text-gray-600">Basic API Knowledge</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Module title="Module 1: Getting Started" duration="15 minutes" icon={FileText} defaultOpen={true}>
        <Exercise title="Exercise 1.1: Setting Up Your Environment">
          <p className="mb-3">Prepare your development environment with the necessary tools:</p>
          <Task>Create a new directory named `food-delivery-api-docs`</Task>
          <Task>Create a new file `food-delivery-api.yaml`</Task>
          <Task>Install recommended VS Code extensions:</Task>
          <Task>Open VS Code Extensions panel (Ctrl+Shift+X or Cmd+Shift+X)</Task>
          <Task>Search and install &quot;OpenAPI (Swagger) Editor&quot;</Task>
          <Task>Search and install &quot;Elemental Preview&quot;</Task>
          <Task>Search and install &quot;YAML&quot; by Red Hat</Task>
          <Task>Search and install &quot;Spectral&quot; plugin</Task>
          <Task>Reload VS Code if prompted</Task>
        </Exercise>

        <Exercise title="Exercise 1.2: Basic Document Structure">
          <p className="mb-3">Start with the basic OpenAPI structure:</p>
          <CodeBlock>
            {`openapi: 3.0.3
info:
  title: Food Delivery API
  version: 1.0.0`}
          </CodeBlock>
          
          <p className="mb-3">Add expanded API information:</p>
          <CodeBlock>
            {`info:
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
    email: support@fooddelivery.example.com`}
          </CodeBlock>
        </Exercise>

        <Exercise title="Exercise 1.3: Introducing Tags">
          <p className="mb-3">Tags help organize API features:</p>
          <CodeBlock>
            {`tags:
  - name: Restaurants
    description: Operations related to restaurant listings
  - name: Menu
    description: Operations for browsing and managing menus
  - name: Orders
    description: Order placement and management
  - name: Delivery
    description: Delivery tracking and updates`}
          </CodeBlock>
        </Exercise>
        <Exercise title="Exercise 1.4: Define Servers">
          <p className="mb-3">Define the server urls of the different API environments:</p>
          <CodeBlock>
            {`servers:
  - url: https://api.fooddelivery.example.com/v1
    description: Production server
  - url: https://staging.api.fooddelivery.example.com/v1
    description: Staging server`}
          </CodeBlock>
        </Exercise>
        <Exercise title="Exercise 1.5: Introducing Security">
          <p className="mb-3">Define the security scheme(We are designing for bearer token authentication):</p>
          <CodeBlock>
            {`components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer`}
          </CodeBlock>

          <p className="mb-3">Apply the pre-defined security scheme to the API globally:</p>
          <CodeBlock>
            {`security: # Apply globally
  - BearerAuth: []`}
          </CodeBlock>
        </Exercise>
      </Module>

      <Module title="Module 2: Component Schemas" duration="20 minutes" icon={Database}>  
        <p className="mb-3">
    Information modeling involves defining and structuring data to represent real-world entities and their relationships within a system.
      </p>
      <p className="mb-3">
        Creating API models is a fundamental aspect of API design, this process includes creating schemas that specify the structure, types, and constraints of the data exchange. These schemas serve as blueprints (a clear contract for API interactions), ensuring consistency, reliability, and ease of maintenance in API interactions.
      </p>
      <p className="mb-3">
        In this module, we will focus on modelling the schemas for the food delivery API, detailing its attributes and relationships to other entities. This exercise will provide practical experience in creating API schemas, reinforcing the importance of clear data modeling in API development.
      </p>
        <Exercise title="Exercise 2.1: Restaurant Schema">
          <p className="mb-3">Define the Restaurant schema:</p>
          <CodeBlock>
{`components:
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
        - name`}
          </CodeBlock>
        </Exercise>

        <Exercise title="Exercise 2.2: Menu Schema">
          <p className="mb-3">Define the Menu and MenuItem schema:</p>
          <CodeBlock>
{`components:
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
        - name`}
          </CodeBlock>
        </Exercise>

        <Exercise title="Exercise 2.3: Order Schema">
          <p className="mb-3">Define the Order schema:</p>
          <CodeBlock>
{`components:
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
        - name`}
          </CodeBlock>
        </Exercise>

        <Exercise title="Exercise 2.4: Delivery Schema">
          <p className="mb-3">Define the Delivery schema:</p>
          <CodeBlock>
{`components:
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
        - name`}
          </CodeBlock>
        </Exercise>
      </Module>


      <Module title="Module 3: Request and Response Modeling" duration="20 minutes" icon={Route}>
        <Exercise title="Exercise 3.1: Create Restaurant Request">
          <p className="mb-3">Define the request body for creating a restaurant:</p>
          <Task>Create a new example for the request in the components section:</Task>
          <CodeBlock>
{`components:
  examples:
    RestaurantRequestExample:
      summary: Example of a restaurant creation request
      value:
        name: "The Great Grill"
        address: "123 Main Street, Cityville"
        rating: 4.5`}
          </CodeBlock>
          <Task>Describe the API operations starting with the &quot;paths&quot; statement:</Task>
          <CodeBlock>{`paths:`}
          </CodeBlock>
          <Task>Describe the POST /restaurants operation and Reference this example in the requestBody:</Task>
          <CodeBlock>
{`paths:
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
                $ref: '#/components/examples/RestaurantRequestExample'`}
          </CodeBlock>
        </Exercise>

        <Exercise title="Exercise 3.2: Get Restaurant Response">
          <p className="mb-3">Define the response for fetching restaurant details:</p>
          <Task>Create a new example for the response in the components section:</Task>
          <CodeBlock>
{`components:
  examples:
    RestaurantResponseExample:
      summary: Example of a restaurant response
      value:
        id: "123e4567-e89b-12d3-a456-426614174254"
        name: "The Great Grill"
        address: "123 Main Street, Cityville"
        rating: 4.5`}
          </CodeBlock>
          <Task>Reference this example in the GET /restaurants/:id response:</Task>
          <CodeBlock>
{`paths:
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
                  $ref: '#/components/examples/RestaurantResponseExample'`}
          </CodeBlock>
        </Exercise>
      </Module>

      <Module title="Module 4: Add Event Subscription operation and CallBack" duration="5 minutes" icon={Rocket}>
        <Exercise title="Exercise 4.1: Define API Event subscription operation">
          <p className="mb-3">Define event subscriptions to describe asynchronous operations where the Food delivery API sends event notifications to the client:</p>
          <Task>Define a &quot;subscriptions&quot; operation:</Task>
          <CodeBlock>
{`paths:
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
                    format: uuid`}
          </CodeBlock>
        </Exercise>

        <Exercise title="Exercise 4.2: Add an event Callback for the subscriptions">
          <p className="mb-3">Define the event callback emanating from the API to the subscriber callback URL:</p>
          <Task>Define a callback to send notifications to the subscriber callback URL when an event occurs:</Task>
          <CodeBlock>
{`paths:
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
          '{$request.body#/callbackUrl}': #See requestBody
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
                  description: Callback received successfully`}
          </CodeBlock>

          
        </Exercise>
      </Module>

      <Module title="Wrapping it up" duration="5 minutes" icon={GraduationCap}>
        <Card className="mt-8">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">What Good Looks Like</h2>
            <p className="mb-3">Here&apos;s a complete example of a well-defined OpenAPI 3.0 specification:</p>
            <CodeBlock>
{`openapi: 3.0.3
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
security: # Apply globally
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
          '{$request.body#/callbackUrl}': #See requestBody
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
`}
            </CodeBlock>
          </CardContent>


      </Card>
      </Module>
      <Card className="mt-8">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Workshop Completion Checklist</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Task>Basic document structure complete</Task>
              <Task>Servers defined</Task>
              <Task>Components created</Task>
              <Task>Endpoints documented</Task>
            </div>
            <div className="space-y-2">
              <Task>Security configured</Task>
              <Task>Examples added</Task>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
