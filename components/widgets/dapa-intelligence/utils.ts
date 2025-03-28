import React from 'react';
import { Globe, Database, FileJson, BarChart, AlertCircle } from 'lucide-react';
import { ContextType } from './types';

// Format timestamp for display
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Get context icon based on context type
export const getContextIcon = (contextType: ContextType): React.ReactNode => {
  switch(contextType) {
    case 'current-window':
      return React.createElement(Globe, { className: "w-4 h-4" });
    case 'data-models':
      return React.createElement(Database, { className: "w-4 h-4" });
    case 'api-contracts':
      return React.createElement(FileJson, { className: "w-4 h-4" });
    case 'data-quality':
      return React.createElement(BarChart, { className: "w-4 h-4" });
    case 'api-quality':
      return React.createElement(AlertCircle, { className: "w-4 h-4" });
    default:
      return React.createElement(Globe, { className: "w-4 h-4" });
  }
};

// Get context name from context type
export const getContextName = (contextType: ContextType): string => {
  switch(contextType) {
    case 'current-window':
      return 'Current Window';
    case 'data-models':
      return 'Data Models';
    case 'api-contracts':
      return 'API Contracts';
    case 'data-quality':
      return 'Data Quality';
    case 'api-quality':
      return 'API Quality';
    default:
      return 'Current Window';
  }
};

// Detect context from URL
export const detectContextFromUrl = (url: string): ContextType | null => {
  if (url.includes('data-models') || url.includes('schema')) {
    return 'data-models';
  } else if (url.includes('api-contract') || url.includes('openapi')) {
    return 'api-contracts';
  } else if (url.includes('data-quality') || url.includes('quality')) {
    return 'data-quality';
  } else if (url.includes('api-quality')) {
    return 'api-quality';
  } 
  return null;
};

// Simple tokenizer (just an approximation)
export const countTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

// Check if a question is about scores or ratings
export const isScoreRelatedQuestion = (text: string): boolean => {
  const lowercaseText = text.toLowerCase();
  return lowercaseText.includes('score') || 
         lowercaseText.includes('grade') || 
         lowercaseText.includes('rating') ||
         lowercaseText.includes('quality');
};

// Check if a question is about fixing or steps
export const isFixRelatedQuestion = (text: string): boolean => {
  const lowercaseText = text.toLowerCase();
  return lowercaseText.includes('how') || 
         lowercaseText.includes('fix') || 
         lowercaseText.includes('steps') ||
         lowercaseText.includes('improve') ||
         lowercaseText.includes('enhance');
};