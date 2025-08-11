'use client'
import React, { useState, useEffect } from 'react';
import { MessageSquare, Calendar, Users, ChevronRight, Plus, Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ConversationSummary {
  _id: string;
  topic: string;
  user_agent: { name: string };
  assistant_agent: { name: string };
  model: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const ConversationsList = () => {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState('all');

  const models = [
    { id: 'all', name: 'All Models' },
    { id: 'moonshotai/kimi-k2-instruct', name: 'Moonshot Kimi K2' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' },
    { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B' }
  ];

  useEffect(() => {
    loadConversations();
  }, [pagination.page]);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/conversations?page=${pagination.page}&limit=${pagination.limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to load conversations');
      }

      const data = await response.json();
      setConversations(data.conversations);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.user_agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.assistant_agent.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModel = selectedModel === 'all' || conv.model === selectedModel;
    
    return matchesSearch && matchesModel;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString();
  };

  const getModelDisplayName = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    return model ? model.name : modelId;
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-500 rounded-full">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Conversations
          </h1>
          <p className="text-lg text-gray-600">
            Explore all the conversations created by the community
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations, topics, or agent names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Model Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[160px]"
              >
                {models.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Create New Button */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              New Conversation
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Conversations Grid */}
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No conversations found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedModel !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Be the first to create a conversation!'}
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create First Conversation
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 mb-6">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation._id}
                  onClick={() => router.push(`/convo/${conversation._id}`)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer hover:border-blue-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {conversation.topic}
                        </h3>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                          {getModelDisplayName(conversation.model)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span>{conversation.user_agent.name}</span>
                        </div>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>{conversation.assistant_agent.name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{conversation.message_count} messages</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(conversation.updated_at)}</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-400 mt-1" />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="text-center text-sm text-gray-500 mt-6">
              Showing {filteredConversations.length} of {pagination.total} conversations
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConversationsList;