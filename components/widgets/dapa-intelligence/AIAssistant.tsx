import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, X, Send, Minimize2, ChevronUp, RotateCcw, 
  Copy, Sparkles, ChevronDown, Globe
} from 'lucide-react';

// Import from our other files
import { 
  ContextType, Message, AnalyticsData, 
  suggestedQueriesByContext
} from './types';
import { 
  formatTimestamp, getContextIcon, 
  getContextName
} from './utils';
import {
  useAutoDetectContext, useTrackAnalytics,
  useClickOutside, useAIResponse, useScrollToBottom
} from './hooks';

const AIAssistant: React.FC = () => {
  // State
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [context, setContext] = useState<ContextType>('current-window');
  const [showContextDropdown, setShowContextDropdown] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    lastTokens: 0,
    totalTokens: 0,
    activeContext: 'current-window',
    startTime: new Date()
  });
  const [autoDetectContext, setAutoDetectContext] = useState<boolean>(true);
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Use our custom hooks
  useAutoDetectContext(autoDetectContext, hasUserInteracted, setContext);
  useTrackAnalytics(messages, context, setAnalytics);
  useClickOutside(dropdownRef, () => setShowContextDropdown(false));
  useScrollToBottom(messagesEndRef, [messages]);

  // Event handlers
  const toggleChat = (): void => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = (): void => {
    setIsMinimized(!isMinimized);
  };

  const toggleContextDropdown = (): void => {
    setShowContextDropdown(!showContextDropdown);
  };

  const toggleAutoDetect = (): void => {
    setAutoDetectContext(!autoDetectContext);
  };

  const handleContextChange = (newContext: ContextType): void => {
    setContext(newContext);
    setShowContextDropdown(false);
    setHasUserInteracted(true);
    
    // Add system message about context change
    const contextChangeMessage: Message = {
      sender: 'ai',
      text: `Context switched to ${getContextName(newContext)}. I'll now focus on this specific domain.`,
      timestamp: new Date().toISOString(),
      contextType: newContext
    };
    
    setMessages(prev => [...prev, contextChangeMessage]);
  };

  const clearChat = (): void => {
    setMessages([]);
  };
  
  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const applySuggestion = (suggestion: string): void => {
    setInputValue(suggestion);
    setHasUserInteracted(true);
  };

  const getAIResponse = useAIResponse();
  
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Set user has interacted to prevent auto context switching
    setHasUserInteracted(true);
    
    // Add user message
    const userMessage: Message = {
      sender: 'user',
      text: inputValue.trim(),
      timestamp: new Date().toISOString(),
      contextType: context
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Hide suggestions after user sends a message
    setShowSuggestions(false);

    // Get AI response using our hook
    const aiResponseText = getAIResponse(context, inputValue, messages);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toISOString(),
        contextType: context
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      
      // Show suggestions again after AI responds
      setTimeout(() => {
        setShowSuggestions(true);
      }, 1000);
    }, 1500);
  };

  return (
    <div className="fixed bottom-16 left-4 z-50">
      {/* Chat button */}
      <button
        onClick={toggleChat}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 transition-colors focus:outline-none"
        aria-label="Chat with AI Assistant"
      >
        <Bot className="w-6 h-6" />
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          className={`absolute bottom-14 left-0 bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 ease-in-out ${
            isMinimized ? 'w-72 h-12' : 'w-96 h-96'
          }`}
        >
          {/* Chat header */}
          <div className="flex items-center justify-between px-4 py-2 bg-teal-600 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <h3 className="font-medium text-sm">DAPA Intelligence</h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleMinimize}
                className="text-white p-1 hover:bg-teal-700 rounded"
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleChat}
                className="text-white p-1 hover:bg-teal-700 rounded"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat body (hidden when minimized) */}
          {!isMinimized && (
            <>
              {/* Context selector with enhanced UI */}
              <div className="px-3 py-2 border-b relative">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center justify-between cursor-pointer px-2 py-1 rounded hover:bg-gray-100 flex-1 mr-2"
                    onClick={toggleContextDropdown}
                  >
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      {getContextIcon(context)}
                      <span>Context: {getContextName(context)}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showContextDropdown ? 'transform rotate-180' : ''}`} />
                  </div>
                  
                  {/* Auto-detect toggle */}
                  <button
                    onClick={toggleAutoDetect}
                    className={`text-xs px-2 py-1 rounded ${
                      autoDetectContext ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-700'
                    }`}
                    title={autoDetectContext ? "Auto-detect context is ON" : "Auto-detect context is OFF"}
                  >
                    <span>Auto</span>
                  </button>
                </div>
                
                {/* Context dropdown with enhanced UI */}
                {showContextDropdown && (
                  <div 
                    ref={dropdownRef}
                    className="absolute left-0 right-0 bg-white border border-gray-200 mt-1 rounded-md shadow-lg z-10"
                  >
                    <div className="py-1">
                      <button
                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 ${context === 'current-window' ? 'bg-gray-50 text-teal-600' : ''}`}
                        onClick={() => handleContextChange('current-window')}
                      >
                        <Globe className="w-4 h-4" />
                        <div className="flex flex-col">
                          <span>Current Window</span>
                          <span className="text-xs text-gray-500">Analyzes content in current view</span>
                        </div>
                      </button>
                      {/* Other context options */}
                      {(['data-models', 'api-contracts', 'data-quality', 'api-quality'] as ContextType[]).map((ctxType) => (
                        <button
                          key={ctxType}
                          className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 ${context === ctxType ? 'bg-gray-50 text-teal-600' : ''}`}
                          onClick={() => handleContextChange(ctxType)}
                        >
                          {getContextIcon(ctxType)}
                          <div className="flex flex-col">
                            <span>{getContextName(ctxType)}</span>
                            <span className="text-xs text-gray-500">
                              {ctxType === 'data-models' && "Assists with schema structures"}
                              {ctxType === 'api-contracts' && "Analyzes API specifications"}
                              {ctxType === 'data-quality' && "Improves data quality scores"}
                              {ctxType === 'api-quality' && "Enhances API quality metrics"}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div 
                ref={chatBodyRef}
                className="h-52 overflow-y-auto p-3 bg-gray-50"
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Bot className="w-12 h-12 text-teal-600 mb-2" />
                    <p className="text-gray-500 text-sm">
                      How can DAPA Intelligence help with your data and API work today?
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`rounded-lg px-3 py-2 max-w-[90%] relative group ${
                            message.sender === 'user'
                              ? 'bg-teal-600 text-white'
                              : message.contextType !== undefined && message.contextType !== context
                              ? 'bg-gray-100 text-gray-800 border border-gray-200' // Different styling for messages from other contexts
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          {/* Context badge for AI messages */}
                          {message.sender === 'ai' && message.contextType && (
                            <div className="absolute -top-2 -left-1 px-1.5 py-0.5 bg-white rounded-full border border-gray-200 shadow-sm text-[10px] text-gray-600 flex items-center gap-1">
                              {getContextIcon(message.contextType)}
                              <span>{getContextName(message.contextType)}</span>
                            </div>
                          )}
                          
                          <p className="text-sm break-words">{message.text}</p>
                          <div className="opacity-0 group-hover:opacity-100 absolute top-0 right-0 -mt-4 flex">
                            <button 
                              onClick={() => copyToClipboard(message.text)}
                              className="text-gray-400 hover:text-gray-600 p-1"
                              aria-label="Copy message"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="block text-xs opacity-50 mt-1">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-200 rounded-lg px-3 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Suggested queries - shown after AI response when no typing is happening */}
                    {showSuggestions && !isTyping && messages.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-2">Suggested queries:</p>
                        <div className="flex flex-wrap gap-2">
                          {suggestedQueriesByContext[context].map((query, index) => (
                            <button
                              key={index}
                              onClick={() => applySuggestion(query)}
                              className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full border border-teal-100 hover:bg-teal-100 transition-colors"
                            >
                              {query}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Analytics panel */}
              {messages.length > 0 && !isMinimized && (
                <div className="px-3 py-1 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-xs text-gray-500">
                  <span>Tokens: {analytics.totalTokens}</span>
                  <span>Session: {Math.floor((new Date().getTime() - analytics.startTime.getTime()) / 60000)}m</span>
                </div>
              )}

              {/* Chat footer */}
              <div className="p-3 border-t">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 py-1 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={clearChat}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Clear chat"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className={`bg-teal-600 text-white p-1.5 rounded-md hover:bg-teal-700 ${
                      !inputValue.trim() ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAssistant;