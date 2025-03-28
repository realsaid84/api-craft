# DAPA Intelligence

DAPA Intelligence is a context-aware AI assistant built specifically for the DAPA (Data & API Accelerator) studio. The assistant provides intelligent, context-specific help related to data models, API contracts, and quality metrics.

## Features

- **Context-Aware Intelligence**: Automatically detects the appropriate context based on the current URL and page content
- **Multiple Context Modes**: Supports Current Window, Data Models, API Contracts, Data Quality, and API Quality contexts
- **Suggested Queries**: Provides context-specific suggested queries to help users get started
- **Intelligent Response System**: Provides more coherent follow-up responses and detects question types
- **Analytics Tracking**: Shows token usage and session duration

## File Structure

- `AIAssistant.tsx` - Main component that renders the chat widget
- `types.ts` - TypeScript interfaces and constants for messages, contexts, and suggested queries
- `utils.ts` - Utility functions for working with contexts, formatting, and analysis
- `hooks.ts` - Custom React hooks for context detection, analytics, and other features
- `index.ts` - Exports all components and utilities for easy imports

## Usage

Import the AIAssistant component in your layout or page:

```tsx
import { AIAssistant } from '@/components/widgets/dapa-intelligence';

function MyPage() {
  return (
    <div>
      <h1>My Page Content</h1>
      {/* Other components */}
      <AIAssistant />
    </div>
  );
}

export default MyPage;
```

## Context Types

The assistant supports the following contexts:

- **Current Window**: Analyzes content in the current view
- **Data Models**: Assists with schema structures and data model design
- **API Contracts**: Analyzes API specifications and OpenAPI documents
- **Data Quality**: Provides insights on data quality metrics and improvements
- **API Quality**: Helps enhance API quality metrics and security

## Customization

You can customize the suggested queries by editing the `suggestedQueriesByContext` object in `types.ts`.

You can also modify the responses for each context by editing the `responsesByContext` object.

## Technical Details

- Built with React and TypeScript
- Uses custom hooks for better separation of concerns
- Follows modern React patterns and best practices