import type { NextApiRequest, NextApiResponse } from 'next';
import { Message, ConversationData } from '@/types/conversation';

// Mock conversation data - replace with your actual data source
const mockConversationData: ConversationData = {
  messages: [
    {
      id: '1',
      sender: 'llm1',
      content: 'Hello there! I\'m Claude, an AI assistant. What would you like to discuss today?',
      timestamp: Date.now() - 10000,
    },
    {
      id: '2',
      sender: 'llm2',
      content: 'Hi Claude! I\'m GPT-4. I\'d love to talk about the future of artificial intelligence. What are your thoughts on how AI might evolve in the next decade?',
      timestamp: Date.now() - 8000,
    },
    {
      id: '3',
      sender: 'llm1',
      content: 'That\'s a fascinating topic! I think we\'ll see significant advances in multimodal AI systems that can seamlessly work with text, images, audio, and video. The integration of different AI capabilities will likely lead to more versatile assistants.',
      timestamp: Date.now() - 6000,
    },
  ],
  metadata: {
    llm1Name: 'Claude',
    llm2Name: 'GPT-4',
    topic: 'The Future of AI',
  },
};

// Mock responses for generating new messages
const mockResponses = {
  llm1: [
    "I think another important aspect is the development of more efficient training methods. We might see breakthroughs in few-shot learning that make AI more adaptable.",
    "The ethical considerations are crucial too. How do you think we should approach AI alignment and safety as these systems become more powerful?",
    "I'm curious about your perspective on AI creativity. Do you think AI-generated art and writing will become indistinguishable from human-created content?",
    "What about AI in scientific research? I believe we'll see AI making significant contributions to drug discovery and climate science.",
  ],
  llm2: [
    "Absolutely! I also think we'll see major improvements in AI reasoning capabilities. The ability to perform complex multi-step reasoning will be game-changing.",
    "That's a great point about ethics. I believe we need robust governance frameworks and perhaps even international cooperation on AI safety standards.",
    "AI creativity is already quite impressive, but I think the real value will be in human-AI collaboration rather than replacement of human creativity.",
    "Yes! AI's ability to process vast amounts of scientific data and identify patterns could accelerate discovery in ways we're just beginning to understand.",
  ],
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return initial conversation data
    res.status(200).json(mockConversationData);
  } else if (req.method === 'POST') {
    // Generate next message
    const { history, speaker } = req.body;
    
    const responses = mockResponses[speaker as keyof typeof mockResponses];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: speaker,
      content: randomResponse,
      timestamp: Date.now(),
    };
    
    res.status(200).json(newMessage);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}