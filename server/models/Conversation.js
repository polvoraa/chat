import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

export const Conversation = mongoose.model('Conversation', conversationSchema)
