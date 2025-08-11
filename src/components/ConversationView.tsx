// components/ConversationView.tsx
import React from 'react';
import { Message } from '@/types/conversation';

interface ConversationViewProps {
  messages: Message[];
  llm1Name: string;
  llm2Name: string;
  isTyping?: boolean;
  typingSender?: 'llm1' | 'llm2';
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  messages,
  llm1Name,
  llm2Name,
  isTyping,
  typingSender,
}) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="flex-1 bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'llm1' ? 'justify-start' : 'justify-end'
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'llm1'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-500 text-white'
              }`}
            >
              <div className="text-xs opacity-75 mb-1">
                {message.sender === 'llm1' ? llm1Name : llm2Name} • {formatTime(message.timestamp)}
              </div>
              <div>{message.content}</div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div
            className={`flex ${
              typingSender === 'llm1' ? 'justify-start' : 'justify-end'
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                typingSender === 'llm1'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-500 text-white'
              }`}
            >
              <div className="text-xs opacity-75 mb-1">
                {typingSender === 'llm1' ? llm1Name : llm2Name} is typing...
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};