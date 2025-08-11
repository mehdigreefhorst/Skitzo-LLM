# database/models.py
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
from typing import List, Dict, Optional

class MongoDB:
    def __init__(self):
        self.client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
        self.db = self.client.ai_conversations
        self.conversations = self.db.conversations
        
    def create_indexes(self):
        """Create necessary indexes for better performance"""
        self.conversations.create_index("created_at")
        self.conversations.create_index("model")

class ConversationDB:
    def __init__(self):
        self.mongodb = MongoDB()
        self.collection = self.mongodb.conversations
    
    def create_conversation(self, config: dict) -> str:
        """Create a new conversation and return its ID"""
        conversation_doc = {
            "model": config["model"],
            "user_agent": {
                "name": config["agent1Name"],
                "prompt": config["agent1Prompt"]
            },
            "assistant_agent": {
                "name": config["agent2Name"], 
                "prompt": config["agent2Prompt"]
            },
            "topic": config.get("topic", "General Discussion"),
            "messages": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True,
            "message_count": 0
        }
        
        result = self.collection.insert_one(conversation_doc)
        return str(result.inserted_id)
    
    def get_conversation(self, conversation_id: str) -> Optional[dict]:
        """Get a specific conversation by ID"""
        try:
            doc = self.collection.find_one({"_id": ObjectId(conversation_id)})
            if doc:
                doc["_id"] = str(doc["_id"])
                return doc
            return None
        except:
            return None
    
    def add_message(self, conversation_id: str, role: str, content: str) -> bool:
        """Add a message to an existing conversation"""
        try:
            message = {
                "role": role,
                "content": content,
                "timestamp": datetime.utcnow()
            }
            
            result = self.collection.update_one(
                {"_id": ObjectId(conversation_id)},
                {
                    "$push": {"messages": message},
                    "$set": {"updated_at": datetime.utcnow()},
                    "$inc": {"message_count": 1}
                }
            )
            return result.modified_count > 0
        except:
            return False
    
    def get_all_conversations(self, page: int = 1, limit: int = 20) -> List[dict]:
        """Get all conversations with pagination"""
        skip = (page - 1) * limit
        
        cursor = self.collection.find().sort("updated_at", -1).skip(skip).limit(limit)
        conversations = []
        
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            # Only include summary data for list view
            summary = {
                "_id": doc["_id"],
                "topic": doc["topic"],
                "user_agent": {"name": doc["user_agent"]["name"]},
                "assistant_agent": {"name": doc["assistant_agent"]["name"]},
                "model": doc["model"],
                "message_count": doc["message_count"],
                "created_at": doc["created_at"],
                "updated_at": doc["updated_at"]
            }
            conversations.append(summary)
            
        return conversations
    
    def get_total_conversations(self) -> int:
        """Get total number of conversations"""
        return self.collection.count_documents({})
    
    def delete_conversation(self, conversation_id: str) -> bool:
        """Delete a conversation"""
        try:
            result = self.collection.delete_one({"_id": ObjectId(conversation_id)})
            return result.deleted_count > 0
        except:
            return False

# Preset system prompts
PRESET_PROMPTS = {
    "helpful_assistant": {
        "name": "Helpful Assistant",
        "prompt": "You are a helpful AI assistant focused on providing clear, accurate, and useful information. You're patient, thorough, and always aim to be genuinely helpful."
    },
    "creative_writer": {
        "name": "Creative Writer", 
        "prompt": "You are a creative and imaginative writer with a flair for storytelling, poetry, and artistic expression. You love to explore new ideas and push creative boundaries."
    },
    "critical_thinker": {
        "name": "Critical Thinker",
        "prompt": "You are a thoughtful analyst who asks probing questions, challenges assumptions, and looks at problems from multiple angles. You value evidence and logical reasoning."
    },
    "optimistic_coach": {
        "name": "Optimistic Coach",
        "prompt": "You are an enthusiastic and supportive coach who sees the best in every situation. You motivate others, provide encouragement, and help people achieve their goals."
    },
    "philosophical_thinker": {
        "name": "Philosophical Thinker", 
        "prompt": "You are a deep philosophical thinker who ponders life's big questions, explores ethical dilemmas, and examines the meaning behind human experiences."
    },
    "technical_expert": {
        "name": "Technical Expert",
        "prompt": "You are a technical expert with deep knowledge in programming, engineering, and technology. You explain complex concepts clearly and provide practical solutions."
    },
    "skeptical_analyst": {
        "name": "Skeptical Analyst",
        "prompt": "You are naturally skeptical and always question claims, look for evidence, and point out potential flaws or alternative explanations. You value critical thinking above all."
    },
    "empathetic_counselor": {
        "name": "Empathetic Counselor",
        "prompt": "You are a warm, empathetic counselor who listens deeply, provides emotional support, and helps people process their feelings and experiences."
    }
}