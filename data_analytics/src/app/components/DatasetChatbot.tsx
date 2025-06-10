"use client";

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface DatasetChatbotProps {
  datasetId: string;
  datasetTitle: string;
}

const DatasetChatbot: React.FC<DatasetChatbotProps> = ({ datasetId, datasetTitle }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: `Hi there! I'm your AI assistant for the "${datasetTitle}" dataset. How can I help you analyze this data?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // In production, you would call your AI service API here
      // const response = await fetch(`/api/dataset-chat/${datasetId}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message: userMessage.content })
      // });
      // const data = await response.json();
      
      // For demo, simulate a response after a short delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample responses based on common data questions
      let aiResponse = '';
      const lowerCaseInput = userMessage.content.toLowerCase();
      
      if (lowerCaseInput.includes('missing') || lowerCaseInput.includes('null')) {
        aiResponse = 'This dataset has some missing values in certain columns. The most affected columns are typically categorical features, with approximately 5-8% of values missing overall.';
      } else if (lowerCaseInput.includes('correlation') || lowerCaseInput.includes('relationship')) {
        aiResponse = 'There appears to be a strong positive correlation between features X and Y (correlation coefficient 0.78), suggesting that as X increases, Y tends to increase as well.';
      } else if (lowerCaseInput.includes('outlier')) {
        aiResponse = 'I detected several outliers in the numerical columns, particularly in columns related to measurements and time-based metrics. These outliers represent approximately 2.3% of the dataset.';
      } else if (lowerCaseInput.includes('distribution')) {
        aiResponse = 'The numerical features in this dataset generally follow a normal distribution with some right skewness observed in financial metrics.';
      } else if (lowerCaseInput.includes('summary') || lowerCaseInput.includes('overview')) {
        aiResponse = `This dataset contains ${Math.floor(Math.random() * 20) + 5} features and appears to be related to ${datasetTitle.toLowerCase()}. The data quality is generally good with minimal missing values and a few outliers that might need attention during preprocessing.`;
      } else {
        aiResponse = `Based on my analysis of the ${datasetTitle} dataset, I can tell you that it contains structured data with both numerical and categorical features. The most important features appear to be related to the central theme of the dataset. Would you like me to analyze any specific aspect of this data?`;
      }
      
      const aiMessage: Message = {
        role: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMessage: Message = {
        role: 'ai',
        content: 'Sorry, I encountered an error analyzing this dataset. Please try again later.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold">Dataset AI Assistant</h3>
        <p className="text-sm text-gray-500">Ask questions about this dataset to get insights</p>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs text-right mt-1 opacity-60">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-[80%]">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Ask about this dataset..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default DatasetChatbot;
