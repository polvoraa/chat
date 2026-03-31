import cors from 'cors'
import express from 'express'
import conversationRoutes from './routes/conversationRoutes.js'
import { config } from './config.js'
import { connectDatabase } from './db.js'

const app = express()

app.use(
  cors({
    origin: config.clientUrl,
  }),
)
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/conversations', conversationRoutes)

app.use((error, _req, res, _next) => {
  void _next
  console.error(error)
  res.status(500).json({
    error: error.message || 'Erro interno do servidor.',
  })
})

async function start() {
  try {
    await connectDatabase()
    app.listen(config.port, () => {
      console.log(`API pronta em http://localhost:${config.port}`)
    })
  } catch (error) {
    console.error('Falha ao iniciar o backend:', error)
    process.exit(1)
  }
}

start()
