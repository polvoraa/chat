import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: Number(process.env.PORT || 5000),
  mongoUri:
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-chatbot',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
}
