export interface Message {
  id: string;
  sender: 'llm1' | 'llm2';
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