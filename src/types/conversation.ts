export interface Message {
  id: string;
  sender: 'assistant' | 'user';
  content: string;
  timestamp: number;
}

export interface ConversationData {
  messages: Message[];
  metadata: {
    llm1Name: string;
    llm2Name: string;
    topic: string;
  };
} 