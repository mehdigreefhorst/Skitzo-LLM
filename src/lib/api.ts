import { ConversationData, Message } from "@/types/conversation";

export interface SetupConfig {
  model: string;
  agent1Name: string;
  agent1Prompt: string;
  agent2Name: string;
  agent2Prompt: string;
  topic: string;
}


export class ConversationAPI {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async getConversationData(): Promise<ConversationData> {
    try {
        console.log("getting the conversation data from the api!")
      const response = await fetch(`${this.baseUrl}/conversation`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching conversation data:', error);
      throw error;
    }
  }

  async generateNextMessage(conversationHistory: Message[], currentSpeaker: 'user' | 'assistant'): Promise<Message> {
    try {
      const response = await fetch(`${this.baseUrl}/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history: conversationHistory,
          speaker: currentSpeaker,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating next message:', error);
      throw error;
    }
  }
  async setupConversation(config: SetupConfig): Promise<{ success: boolean; metadata: any }> {
    const response = await fetch(`${this.baseUrl}/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to setup conversation');
    }

    return response.json();
  }

  async getAvailableModels(): Promise<{ id: string; name: string }[]> {
    const response = await fetch(`${this.baseUrl}/models`);
    if (!response.ok) {
      throw new Error('Failed to fetch available models');
    }
    const data = await response.json();
    return data.models;
  }

  async resetConversation(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/convo/reset`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to reset conversation');
    }
  }
} 



