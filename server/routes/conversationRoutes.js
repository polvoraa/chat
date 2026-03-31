import express from 'express'
import mongoose from 'mongoose'
import { Conversation } from '../models/Conversation.js'
import { Message } from '../models/Message.js'
import { generateAssistantReply } from '../services/aiClient.js'

const router = express.Router()

router.get('/', async (_req, res) => {
  const conversations = await Conversation.find().sort({ updatedAt: -1 }).lean()
  res.json(conversations)
})

router.post('/', async (req, res) => {
  const title = (req.body?.title || 'Nova conversa').trim()
  const conversation = await Conversation.create({ title })
  res.status(201).json(conversation)
})

router.get('/:conversationId/messages', async (req, res) => {
  const { conversationId } = req.params

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({ error: 'ID de conversa invalido.' })
  }

  const messages = await Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .lean()

  return res.json(messages)
})

router.post('/:conversationId/messages', async (req, res) => {
  const { conversationId } = req.params
  const content = req.body?.content?.trim()

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({ error: 'ID de conversa invalido.' })
  }

  if (!content) {
    return res.status(400).json({ error: 'A mensagem e obrigatoria.' })
  }

  const conversation = await Conversation.findById(conversationId)

  if (!conversation) {
    return res.status(404).json({ error: 'Conversa nao encontrada.' })
  }

  const userMessage = await Message.create({
    conversationId,
    role: 'user',
    content,
  })

  const history = await Message.find({ conversationId }).sort({ createdAt: 1 })
  const assistantContent = await generateAssistantReply(history)

  const assistantMessage = await Message.create({
    conversationId,
    role: 'assistant',
    content: assistantContent,
  })

  if (conversation.title === 'Nova conversa') {
    conversation.title = content.slice(0, 48)
  }

  conversation.updatedAt = new Date()
  await conversation.save()

  return res.status(201).json({
    conversation,
    messages: [userMessage, assistantMessage],
  })
})

export default router
