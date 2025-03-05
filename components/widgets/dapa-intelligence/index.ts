// Export the main component
export { default as AIAssistant } from './AIAssistant';

// Export types for external usage
export type { 
  ContextType,
  Message,
  AnalyticsData
} from './types';

// Export utility functions for external usage
export {
  formatTimestamp,
  getContextIcon,
  getContextName,
  detectContextFromUrl,
  countTokens
} from './utils';

// Export hooks for potential reuse
export {
  useAutoDetectContext,
  useTrackAnalytics,
  useClickOutside,
  useAIResponse,
  useScrollToBottom
} from './hooks';