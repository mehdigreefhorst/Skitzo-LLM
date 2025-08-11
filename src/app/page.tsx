'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ConversationAPI } from '@/lib/api';
import { ConversationView } from '@/components/ConversationView';
import { Controls } from '@/components/Controls';
import { Message, ConversationData } from '@/types/conversation';

export default function Home() {
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [typingSender, setTypingSender] = useState<'llm1' | 'llm2'>('llm1');
  const [nextSpeaker, setNextSpeaker] = useState<'llm1' | 'llm2'>('llm1');
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingNew, setIsGeneratingNew] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // >>> New: keep isTyping in a ref so the interval sees the latest value
  const isTypingRef = useRef(false);
  useEffect(() => {
    isTypingRef.current = isTyping;
  }, [isTyping]);

  const api = new ConversationAPI();

  useEffect(() => {
    loadConversation();
  }, []);

  const loadConversation = async () => {
    try {
      setError(null);
      const data = await api.getConversationData();
      setConversationData(data);
      setDisplayedMessages([]);
      setCurrentMessageIndex(0);
      setNextSpeaker('llm1');
      setIsGeneratingNew(false);
    } catch (error) {
      setError('Failed to load conversation data');
      console.error(error);
    }
  };

  const generateNextMessage = async () => {
    if (!conversationData || isTypingRef.current) return;

    try {
      const currentSpeaker = nextSpeaker;
      console.log('[generateNextMessage] currentSpeaker =', currentSpeaker);
      setTypingSender(currentSpeaker);
      setIsTyping(true);

      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const newMessage = await api.generateNextMessage(displayedMessages, currentSpeaker);
      console.log('[generateNextMessage] returned sender =', (newMessage as any)?.sender);
      setDisplayedMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
      setNextSpeaker(currentSpeaker === 'llm1' ? 'llm2' : 'llm1');
      console.log('[generateNextMessage] nextSpeaker ->', currentSpeaker === 'llm1' ? 'llm2' : 'llm1');
    } catch (error) {
      setError('Failed to generate next message');
      setIsTyping(false);
      console.error(error);
    }
  };

  const clearTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const playConversation = () => {
    if (!conversationData) return;

    setIsPlaying(true);
    setIsPaused(false);

    // Clear any existing timers before starting
    clearTimers();

    intervalRef.current = setInterval(() => {
      // Use the REF to avoid stale closure issues
      if (isTypingRef.current) return;

      setCurrentMessageIndex(prevIndex => {
        if (!conversationData) return prevIndex;

        // Show initial seeded messages with typing animation
        if (prevIndex < conversationData.messages.length) {
          const nextMessage = conversationData.messages[prevIndex];

          // Determine who is typing (prefer actual sender if present)
          const sender =
            (nextMessage as any).sender ??
            (prevIndex % 2 === 0 ? 'llm1' : 'llm2');

          setTypingSender(sender as 'llm1' | 'llm2');
          setIsTyping(true);

          // Simulate typing duration based on message length and playback speed
          const len =
            (nextMessage as any).content?.length ??
            (nextMessage as any).text?.length ??
            40;

          const typingMs = Math.max(
            500,
            Math.min(3000, Math.round((len * 30) / Math.max(0.25, speed)))
          );

          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            setDisplayedMessages(prev => {
              const exists = prev.some(msg => msg.id === nextMessage.id);
              return exists ? prev : [...prev, nextMessage];
            });
            setIsTyping(false);
            // Advance the pointer *after* the typing finishes
            setCurrentMessageIndex(i => i + 1);
          }, typingMs);

          // Do not advance index yet; we’ll bump it after typing completes
          return prevIndex;
        } else {
          // All initial messages are shown — now start generating new ones
          if (!isGeneratingNew && !isTypingRef.current) {
            setIsGeneratingNew(true);
            generateNextMessage().finally(() => {
              setIsGeneratingNew(false);
            });
          }
          return prevIndex; // Keep index stable beyond initial script
        }
      });
    }, 3000 / Math.max(0.25, speed));
  };

  const pauseConversation = () => {
    setIsPlaying(false);
    setIsPaused(true);
    clearTimers();
  };

  const stopConversation = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setIsTyping(false);
    setIsGeneratingNew(false);
    clearTimers();
  };

  const resetConversation = () => {
    stopConversation();
    setDisplayedMessages([]);
    setCurrentMessageIndex(0);
    setError(null);
    setIsGeneratingNew(false);
  };

  const handlePlay = () => {
    // Recreate the interval with the current speed
    playConversation();
  };

  // Cleanup interval/timeout on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

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
            onPause={pauseConversation}
            onStop={stopConversation}
            onReset={resetConversation}
            speed={speed}
            onSpeedChange={next => {
              setSpeed(next);
              // Recreate the polling interval with the new speed if currently playing
              if (isPlaying) {
                clearTimers();
                playConversation();
              }
            }}
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
            {conversationData.messages.length > displayedMessages.length &&
              ` • ${conversationData.messages.length - displayedMessages.length} remaining from initial data`
            }
          </div>
        </div>
      </div>
    </div>
  );
}