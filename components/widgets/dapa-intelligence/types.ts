// Define context types for the assistant
export type ContextType = 'current-window' | 'data-models' | 'api-contracts' | 'data-quality' | 'api-quality';

// Define types for message objects
export interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  contextType?: ContextType; // Track which context was used for this message
  suggestion?: boolean; // Flag for suggested responses
}

// Define analytics context
export interface AnalyticsData {
  lastTokens: number;
  totalTokens: number;
  activeContext: ContextType;
  startTime: Date;
}

// Define suggested queries by context
export const suggestedQueriesByContext: Record<ContextType, string[]> = {
  'current-window': [
    "What can you tell me about this page?",
    "Explain the main concepts here",
    "How can I use this feature?",
  ],
  'data-models': [
    "Check my schema for best practices",
    "Generate sample data for this model",
    "How can I improve my data model?",
  ],
  'api-contracts': [
    "Analyze this API for RESTful compliance",
    "Suggest security improvements",
    "Are there missing status codes?",
  ],
  'data-quality': [
    "What's affecting my quality score?",
    "How can I improve documentation?",
    "Check for inconsistencies in my model",
  ],
  'api-quality': [
    "What security issues should I address?",
    "How can I improve my API's score?",
    "Check for missing validations",
  ]
};

// Context-specific AI responses
export const responsesByContext: Record<ContextType, string[]> = {
  'current-window': [
    "I'm analyzing the current page content. How can I help you with what you're currently viewing?",
    "Based on the current page, I can provide specific assistance with this content. What would you like to know?",
    "I see you're working with this page. I can help answer questions or provide insights about what you're viewing.",
    "Looking at the current window, is there anything specific you'd like me to explain or help with?",
    "I'm focused on your current view. Would you like me to analyze any particular aspect of this content?"
  ],
  'data-models': [
    "I see you want to discuss data models. Your model structure looks comprehensive, but have you considered adding more detailed property descriptions?",
    "Looking at these data models, I notice opportunities to enhance the schema with additional validation constraints. Would you like suggestions?",
    "Your data model has good structure. Would you like me to suggest ways to make it more consistent with industry standards?",
    "I can help optimize these data models for better reusability. Would you like me to analyze the inheritance patterns?",
    "These data models could benefit from adding more examples. Would you like me to generate some sample data that matches your schema?"
  ],
  'api-contracts': [
    "Analyzing your API contracts, I notice some endpoints might be missing proper error responses. Would you like me to suggest improvements?",
    "Your API design looks good overall. Have you considered adding more detailed operation descriptions for better developer experience?",
    "Looking at the OpenAPI structure, I see opportunities to enhance the documentation. Would you like specific suggestions?",
    "Your API contracts follow most best practices, but I see potential for improved consistency in parameter naming. Would you like details?",
    "I can help you validate these API contracts against industry standards. Would you like me to perform a detailed review?"
  ],
  'data-quality': [
    "Looking at your data quality metrics, I notice several areas where description coverage could be improved to reach higher scores.",
    "Your data model has a quality score of B-. I can suggest specific improvements to reach an A grade, mainly around validation rules.",
    "The data quality dashboard shows some consistency issues between related models. Would you like me to identify which fields need attention?",
    "I see your data models have good structural quality but documentation scores are lower. Would you like suggestions for improving descriptions?",
    "Based on the data quality report, adding more examples and improving constraint definitions would significantly increase your quality score."
  ],
  'api-quality': [
    "Your API quality metrics show good security implementation but some gaps in documentation coverage. Would you like targeted improvement suggestions?",
    "I notice your API has a few endpoints with lower quality scores. The main issues appear to be parameter validation and response examples.",
    "Looking at the API quality dashboard, adding more detailed responses for error cases would significantly improve your overall score.",
    "The API quality metrics indicate good structure but inconsistent naming patterns across endpoints. Would you like me to suggest standardizations?",
    "I can help you improve your API quality score from B to A by addressing the security warnings flagged in the dashboard."
  ]
};

// Response patterns for follow-up questions
export const followUpResponses = {
  scoreRelated: [
    "Based on my analysis, your data model currently has a B grade. The main areas for improvement are documentation (67%), validation rules (72%), and consistency (83%).",
    "Your current quality score is 78/100. You could reach 90+ by improving error handling, adding more examples, and enhancing field descriptions."
  ],
  fixRelated: [
    "I recommend these steps to improve: 1) Add detailed descriptions to all fields, 2) Include validation rules for string fields, 3) Add examples for complex objects, 4) Standardize naming patterns.",
    "To fix the current issues: First, enhance documentation for all critical paths. Second, add proper error responses. Third, implement consistent validation patterns across similar fields."
  ]
};