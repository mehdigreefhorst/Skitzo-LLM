import { ConversationData, Message } from "@/types/conversation";

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
} 