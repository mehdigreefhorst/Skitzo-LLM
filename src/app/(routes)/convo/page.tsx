'use client'
import React, { useState, useEffect } from 'react';
import { ChevronDown, Play, RotateCcw, Users, Zap, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Preset {
  name: string;
  prompt: string;
}

interface Presets {
  [key: string]: Preset;
}

interface SetupConfig {
  model: string;
  agent1Name: string;
  agent1Prompt: string;
  agent2Name: string;
  agent2Prompt: string;
  topic: string;
}

const ConversationSetup = () => {
  const router = useRouter();
  const [config, setConfig] = useState<SetupConfig>({
    model: 'moonshotai/kimi-k2-instruct',
    agent1Name: 'User Agent',
    agent1Prompt: 'You are a helpful AI assistant focused on providing clear, accurate, and useful information. You\'re patient, thorough, and always aim to be genuinely helpful.',
    agent2Name: 'Assistant Agent',
    agent2Prompt: 'You are a thoughtful AI assistant that asks probing questions, challenges assumptions, and looks at problems from multiple angles. You value evidence and logical reasoning.',
    topic: 'General Discussion'
  });

  const [presets, setPresets] = useState<Presets>({});
  const [models, setModels] = useState([
    { id: 'moonshotai/kimi-k2-instruct', name: 'Moonshot Kimi K2' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' },
    { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B' }
  ]);

  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreset1, setShowPreset1] = useState(false);
  const [showPreset2, setShowPreset2] = useState(false);

  useEffect(() => {
    // Load presets from API
    fetch('/presets')
      .then(res => res.json())
      .then(data => setPresets(data.presets))
      .catch(err => console.error('Failed to load presets:', err));
  }, []);

  const handlePresetSelect = (presetKey: string, agentNumber: 1 | 2) => {
    const preset = presets[presetKey];
    if (!preset) return;

    if (agentNumber === 1) {
      setConfig({
        ...config,
        agent1Name: preset.name,
        agent1Prompt: preset.prompt
      });
      setShowPreset1(false);
    } else {
      setConfig({
        ...config,
        agent2Name: preset.name,
        agent2Prompt: preset.prompt
      });
      setShowPreset2(false);
    }
  };

  const handleStartConversation = async () => {
    setIsStarting(true);
    setError(null);
    
    try {
      const response = await fetch('/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (response.ok) {
        const result = await response.json();
        // Redirect to the new conversation
        router.push(`/convo/${result.conversation_id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to setup conversation');
      }
    } catch (error) {
      setError('Error starting conversation');
      console.error(error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleReset = () => {
    setConfig({
      model: 'moonshotai/kimi-k2-instruct',
      agent1Name: 'User Agent',
      agent1Prompt: 'You are a helpful AI assistant focused on providing clear, accurate, and useful information. You\'re patient, thorough, and always aim to be genuinely helpful.',
      agent2Name: 'Assistant Agent',
      agent2Prompt: 'You are a thoughtful AI assistant that asks probing questions, challenges assumptions, and looks at problems from multiple angles. You value evidence and logical reasoning.',
      topic: 'General Discussion'
    });
    setError(null);
  };

  const PresetDropdown = ({ 
    show, 
    onToggle, 
    onSelect, 
    agentNumber 
  }: { 
    show: boolean; 
    onToggle: () => void; 
    onSelect: (key: string) => void; 
    agentNumber: 1 | 2;
  }) => (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Sparkles className="h-4 w-4" />
        Presets
        <ChevronDown className={`h-4 w-4 transition-transform ${show ? 'rotate-180' : ''}`} />
      </button>
      
      {show && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
          {Object.entries(presets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">{preset.name}</div>
              <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                {preset.prompt.substring(0, 100)}...
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-500 rounded-full">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Conversation Studio
          </h1>
          <p className="text-lg text-gray-600">
            Create dynamic conversations between two AI agents
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-8">
            {/* Model and Topic */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <select
                  value={config.model}
                  onChange={(e) => setConfig({...config, model: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {models.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conversation Topic
                </label>
                <input
                  type="text"
                  value={config.topic}
                  onChange={(e) => setConfig({...config, topic: e.target.value})}
                  placeholder="What should they discuss?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Agents Side by Side */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Agent 1 (User) */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-purple-900">Agent 1 (User)</h3>
                  </div>
                  <PresetDropdown
                    show={showPreset1}
                    onToggle={() => setShowPreset1(!showPreset1)}
                    onSelect={(key) => handlePresetSelect(key, 1)}
                    agentNumber={1}
                  />
                </div>
                
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-800 mb-2">
                      Agent Name
                    </label>
                    <input
                      type="text"
                      value={config.agent1Name}
                      onChange={(e) => setConfig({...config, agent1Name: e.target.value})}
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                      placeholder="Agent name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-800 mb-2">
                      System Prompt
                    </label>
                    <textarea
                      value={config.agent1Prompt}
                      onChange={(e) => setConfig({...config, agent1Prompt: e.target.value})}
                      rows={8}
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white resize-none"
                      placeholder="Define the agent's personality, role, and behavior..."
                    />
                  </div>
                </div>
              </div>

              {/* Agent 2 (Assistant) */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-green-900">Agent 2 (Assistant)</h3>
                  </div>
                  <PresetDropdown
                    show={showPreset2}
                    onToggle={() => setShowPreset2(!showPreset2)}
                    onSelect={(key) => handlePresetSelect(key, 2)}
                    agentNumber={2}
                  />
                </div>
                
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-2">
                      Agent Name
                    </label>
                    <input
                      type="text"
                      value={config.agent2Name}
                      onChange={(e) => setConfig({...config, agent2Name: e.target.value})}
                      className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                      placeholder="Agent name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-2">
                      System Prompt
                    </label>
                    <textarea
                      value={config.agent2Prompt}
                      onChange={(e) => setConfig({...config, agent2Prompt: e.target.value})}
                      rows={8}
                      className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white resize-none"
                      placeholder="Define the agent's personality, role, and behavior..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-100">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              
              <div className="flex-1"></div>
              
              <button
                onClick={() => router.push('/conversations')}
                className="px-6 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                View All Conversations
              </button>
              
              <button
                onClick={handleStartConversation}
                disabled={isStarting}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium"
              >
                {isStarting ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isStarting ? 'Starting...' : 'Start Conversation'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationSetup;