'use client';

import React, { useState, useEffect } from 'react';
import { ConversationAPI } from '@/lib/api';
import { ConversationView } from '@/components/ConversationView';
import { Controls } from '@/components/Controls';
import { Message, ConversationData } from '@/types/conversation';

export default function Home() {
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [typingSender, setTypingSender] = useState<'llm1' | 'llm2'>('llm1');
  const [currentSpeaker, setCurrentSpeaker] = useState<'llm1' | 'llm2'>('llm1');
  const [error, setError] = useState<string | null>(null);

  const api = new ConversationAPI();

  useEffect(() => {
    loadConversation();
    // Start interval that logs every second
  const intervalId = setInterval(() => {
    console.log("isPlaying =", isPlaying);
  }, 1000);
  }, []);

  const loadConversation = async () => {
    try {
      setError(null);
      const data = await api.getConversationData();
      setConversationData(data);
      setDisplayedMessages([]);
      setCurrentSpeaker('llm1');
    } catch (error) {
      setError('Failed to load conversation data');
      console.error(error);
    }
  };

  const generateNextMessage = async (currentSpeakerMessage: "llm1" | "llm2") => {
    console.log("generateNextMessage")
    console.log("!conversationData || isTyping || !isPlaying = ", !conversationData || isTyping || !isPlaying)
    //if (!conversationData || isTyping || !isPlaying) return;

    try {
      console.log('[generateNextMessage] currentSpeaker =', currentSpeakerMessage);
      setTypingSender(currentSpeakerMessage);
      setIsTyping(true);

      // Call API with current speaker
      const newMessage = await api.generateNextMessage(displayedMessages, currentSpeakerMessage);
      console.log('[generateNextMessage] returned message:', newMessage);
      
      // Force correct sender
      const correctedMessage = {
        ...newMessage,
        sender: currentSpeakerMessage
      };
      
      setDisplayedMessages(prev => [...prev, correctedMessage]);
      setIsTyping(false);
      
      // Switch to next speaker
      const nextSpeaker = currentSpeakerMessage === 'llm1' ? 'llm2' : 'llm1';
      setCurrentSpeaker(nextSpeaker);
      console.log('[generateNextMessage] next speaker will be:', nextSpeaker);
      
      // Wait 5 seconds, then generate next message if still playing
      setTimeout(() => {
        console.log("generating new message!")
        console.log("isPlaying && !isPaused = ", isPlaying && !isPaused)
        console.log("isPlaying = ", isPlaying)
        console.log("!isPaused = ", !isPaused)
        if (!isPaused) {
          generateNextMessage(nextSpeaker);
        }
      }, 5000);
      
    } catch (error) {
      setError('Failed to generate next message');
      setIsTyping(false);
      console.error(error);
    }
  };

  const handlePlay = () => {
    console.log("handlePlay")
    setIsPlaying(true);
    setIsPaused(false);
    
    // Start generating messages if we don't have any yet
    generateNextMessage(currentSpeaker);
    
  };

  
  
  
  const handlePause = () => {
    console.log("handle pause")
    setIsPlaying(false);
    setIsPaused(true);
  };

  const handleStop = () => {
    console.log("handle stop")
    setIsPlaying(false);
    setIsPaused(false);
    setIsTyping(false);
  };

  const handleReset = () => {
    console.log("handle reset")
    setIsPlaying(false);
    setIsPaused(false);
    setIsTyping(false);
    setDisplayedMessages([]);
    setCurrentSpeaker('llm1');
    setError(null);
  };

  if (!conversationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Loading conversation...</div>
          {error && (
            <div className="text-red-500 mb-4">{error}</div>
          )}
          <button
            onClick={loadConversation}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            LLM Conversation Viewer
          </h1>
          <p className="text-gray-600">
            Watch {conversationData.metadata.llm1Name} and {conversationData.metadata.llm2Name} discuss: {conversationData.metadata.topic}
          </p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Controls
            isPlaying={isPlaying}
            isPaused={isPaused}
            onPlay={handlePlay}
            onPause={handlePause}
            onStop={handleStop}
            onReset={handleReset}
            speed={speed}
            onSpeedChange={setSpeed}
          />

          <ConversationView
            messages={displayedMessages}
            llm1Name={conversationData.metadata.llm1Name}
            llm2Name={conversationData.metadata.llm2Name}
            isTyping={isTyping}
            typingSender={typingSender}
          />

          <div className="text-center text-sm text-gray-500">
            Showing {displayedMessages.length} messages
            • Next speaker: {currentSpeaker}
          </div>
        </div>
      </div>
    </div>
  );
}