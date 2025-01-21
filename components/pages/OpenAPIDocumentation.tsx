'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Database, Shield, Repeat, Tags, CheckCircle, Code, GitMerge, BookOpen, PhoneCall, GraduationCap, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { xonokai } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface SectionProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}

interface BlockProps {
  children: React.ReactNode;
}

interface CodeBlockProps {
  children: React.ReactNode;
  language?: string;
}

const Section = ({ icon: Icon, title, children }: SectionProps) => (
  <section className="mb-12" aria-labelledby={title.toLowerCase().replace(/\s+/g, '-')}>
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-6 h-6 text-blue-600" aria-hidden="true" />
      <h2 id={title.toLowerCase().replace(/\s+/g, '-')} className="text-2xl font-semibold">
        {title}
      </h2>
    </div>
    <div className="bg-gray-50 p-6 rounded-lg">
      {children}
    </div>
  </section>
);

const CodeBlock = ({ children, language = 'yaml' }: CodeBlockProps) => {
  // Ensure children is a string
  const codeString = typeof children === 'string' ? children : String(children);

  return (
    <div className="rounded-md overflow-hidden">
      <SyntaxHighlighter
        language={language}
        style={xonokai}
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

export const OpenAPIDocumentation = () => {
  return (
    <div className="max-w-5xl mx-auto p-8 bg-white">     
   {/* Add navigation section at the top */}
    <div className="mb-8 flex items-center justify-between">
      <h1 className="text-4xl font-bold">OpenAPI 3.0 Cheatsheet</h1>
      <Link href="learn/openapi-workshop" className="no-underline">
        <Button className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Take the Workshop
        </Button>
      </Link>
    </div>
      
      <Section icon={FileText} title="Document Structure">
        <p className="mb-4">An OpenAPI document is a JSON or YAML file containing these root elements:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CodeBlock>
            {`openapi: 3.0.x
info: {}
servers: []
security: []
tags: []
paths: {}
components: {}`}
          </CodeBlock>
          <div className="text-sm text-gray-600 space-y-1">
            <p># The spec version</p>
            <p># API and document info</p>
            <p># List of available servers</p>
            <p># Authentication description</p>
            <p># Define grouping tags</p>
            <p># List of endpoints</p>
            <p># Reusable components</p>
          </div>
        </div>
      </Section>

      <Section icon={BookOpen} title="General Information">
        <CodeBlock>
          {`info: # Required
  title: Your Awesome API
  version: 1.0.0
  description: What our API does...

servers:
  - url: https://example.org/api
    description: Production
  - url: https://test.api.example.com
    description: Test`}
        </CodeBlock>
      </Section>

      <Section icon={Shield} title="Security">
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Define Security Schemes</h3>
            <CodeBlock>
              {`components:
  securitySchemes:
    ApiKeyAuth: # Arbitrary name
      type: apiKey
      in: header
      name: X-API-KEY
    BearerAuth:
      type: http
      scheme: bearer`}
            </CodeBlock>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Apply Security Schemes</h3>
            <CodeBlock>
              {`security: # Apply globally
  - BearerAuth: []

paths:
  /things:
    get:
      security:
        - ApiKeyAuth: []`}
            </CodeBlock>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Allowed Types</h3>
            <ul className="list-disc ml-6">
              <li>apiKey (in: header, query, or cookie)</li>
              <li>http (basic or bearer)</li>
              <li>oauth2</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section icon={Tags} title="Grouping and Sorting">
  <p className="mb-4">
    In OpenAPI, <strong>tags</strong> are used to group related <strong>API operations</strong>, enhancing the organization and readability of your API documentation. By assigning tags to operations, you can categorize endpoints based on functionality or resources, making it easier for developers to navigate and understand the API&aposs structure.
  </p>
  <p className="mb-4">Define <strong>tags</strong> globally:</p>
  <CodeBlock>
    {`tags:
  - name: Things
    description: Operations related to Things`}
  </CodeBlock>
  <p className="mb-4">Assign <strong>tags</strong> to operations:</p>
  <CodeBlock>
    {`paths:
  /things:
    get:
      tags:
        - Things`}
  </CodeBlock>
  <p className="mt-4">
    By implementing <strong>tags</strong> in this manner, Documentation tools like Stoplight Elements, Redocly or Swagger UI will group and display the operations under their respective categories, improving the user experience.
  </p>
</Section>



      <Section icon={Code} title="API Structure">
        <p className="mb-4">Describe <strong>operations</strong> with the <strong>paths</strong> statement:</p>
        <CodeBlock>
          {`paths:
  /things:
    post: # Operation object (HTTP Verb)
      operationId: createThing
      summary: Create a new Thing
      description: Detailed **description** in CommonMark
      requestBody:
        description: Input data for the new Thing
        required: true
        content:
          application/json:
            schema: # Schema Object
      responses:
        '201':
          description: Successfully created
          content:
            application/json:
              schema: # Schema Object`}
        </CodeBlock>
      </Section>

      <Section icon={Database} title="Data Types and Schemas">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Basic Types</h3>
            <ul className="space-y-2">
              <li><code className="bg-gray-100 px-2 py-1 rounded">null</code> - JSON &quot;null&quot; value</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">boolean</code> - JSON true or false value</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">object</code> - JSON object</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">array</code> - Ordered list of instances</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">integer</code> - Integer</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">number</code> - Base-10 decimal number</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">string</code> - String of Unicode code points</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Example Schema</h3>
            <CodeBlock>
              {`type: object
properties:
  id:
    type: string
    format: uuid
  password:
    type: string
    writeOnly: true
  name:
    type: string
    example: Bert`}
            </CodeBlock>
          </div>
        </div>
      </Section>

      <Section icon={PhoneCall} title="Callbacks">
        <p className="mb-4">Define <strong>callbacks</strong> to describe <strong>asynchronous</strong> operations where the API server sends a request back to the client:</p>
        <CodeBlock>
          {`paths:
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
                  description: Callback received successfully`}
        </CodeBlock>
        <div className="mt-4 text-sm text-gray-600">
          <p>Key components:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li><strong>Callback URL</strong>from request body</li>
            <li>Event payload structure</li>
            <li>Expected response from client</li>
          </ul>
        </div>
      </Section>

      <Section icon={Repeat} title="Reuse Elements">
        <p className="mb-4">Define reusable components:</p>
        <CodeBlock>
          {`components:
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
            $ref: '#/components/schemas/Thing'`}
        </CodeBlock>
        <p className="mt-4 mb-2">Use components with $ref:</p>
        <CodeBlock>
          {`paths:
  /things/{id}:
    get:
      responses:
        '404':
          $ref: '#/components/responses/NotFound'`}
        </CodeBlock>
      </Section>

      <Section icon={GitMerge} title="Polymorphism">
        <p className="mb-4">Combine <strong>schemas</strong> using polymorphism statements:</p>
        <ul className="mb-4 space-y-2">
          <li><code className="bg-gray-100 px-2 py-1 rounded">oneOf</code>: Exactly one of the schemas (<strong>XOR</strong>)</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded">anyOf</code>: One or more of the schemas (<strong>OR</strong>)</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded">allOf</code>: All the schemas (<strong>AND</strong>)</li>
        </ul>
        <Task>oneOf</Task>
        <CodeBlock>
          {`schema:
  oneOf:
    Pet:
      oneOf:
        - $ref: '#/components/schemas/Dog'
        - $ref: '#/components/schemas/Cat'
      discriminator:
        propertyName: pet_type`}
        </CodeBlock>
        <Task>anyOf</Task>
        <CodeBlock>
          {`schema:
    Pet:
      anyOf:
        - $ref: '#/components/schemas/PetMetadata'
        - $ref: '#/components/schemas/PetType'`}
        </CodeBlock>
        <Task>allOf</Task>
        <CodeBlock>
          {`schema:
    Pet:
      allOf:
        - $ref: '#/components/schemas/PetMetadata'
        - $ref: '#/components/schemas/PetType'`}
        </CodeBlock>
      </Section>
      
      {/* Add a call-to-action at the bottom */}
      <div className="mt-12 bg-blue-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Ready to Learn More?</h3>
        <p className="text-gray-600 mb-4">
          Take our interactive workshop to get hands-on experience with OpenAPI documentation.
        </p>
        <Link href="../openapi-workshop" className="no-underline">
          <Button variant="default" className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Start the Workshop
          </Button>
        </Link>
      </div>
    </div>
  );
}