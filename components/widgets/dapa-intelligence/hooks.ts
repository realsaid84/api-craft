import { useEffect, useCallback } from 'react';
import { Message, ContextType, AnalyticsData, responsesByContext, followUpResponses } from './types';
import { detectContextFromUrl, countTokens, isScoreRelatedQuestion, isFixRelatedQuestion } from './utils';

export const useAutoDetectContext = (
  autoDetectEnabled: boolean,
  hasUserInteracted: boolean,
  setContext: React.Dispatch<React.SetStateAction<ContextType>>
) => {
  useEffect(() => {
    if (!autoDetectEnabled || hasUserInteracted) return;
    
    const detectedContext = detectContextFromUrl(window.location.href);
    if (detectedContext) {
      setContext(detectedContext);
    }
  }, [autoDetectEnabled, hasUserInteracted, setContext]);
};

export const useTrackAnalytics = (
  messages: Message[],
  context: ContextType,
  setAnalytics: React.Dispatch<React.SetStateAction<AnalyticsData>>
) => {
  useEffect(() => {
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    const tokens = countTokens(lastMessage.text);
    
    setAnalytics(prev => ({
      ...prev,
      lastTokens: tokens,
      totalTokens: prev.totalTokens + tokens,
      activeContext: context
    }));
  }, [messages, context, setAnalytics]);
};

export const useClickOutside = (
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler]);
};

export const useScrollToBottom = (
  messagesEndRef: React.RefObject<HTMLDivElement | null>,
  dependencies: any[]
) => {
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, dependencies);
};

// Generate AI responses
export const useAIResponse = (): (context: ContextType, inputValue: string, messages: Message[]) => string => {
  return useCallback((context: ContextType, inputValue: string, messages: Message[]): string => {
    // Get context-specific responses
    let responses = [...responsesByContext[context]];
    
    // Check if this is a follow-up question and personalize
    if (messages.length > 0) {
      if (isScoreRelatedQuestion(inputValue)) {
        responses = followUpResponses.scoreRelated;
      } else if (isFixRelatedQuestion(inputValue)) {
        responses = followUpResponses.fixRelated;
      }
    }
    
    // Return a random response
    return responses[Math.floor(Math.random() * responses.length)];
  }, []);
};