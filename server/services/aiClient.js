import { config } from '../config.js'

function buildFallbackReply(message) {
  return [
    'O backend esta funcionando, mas nenhuma chave de IA foi configurada.',
    'Defina GROQ_API_KEY no arquivo .env para usar respostas reais.',
    `Mensagem recebida: "${message}"`,
  ].join(' ')
}

async function requestGroqReply(messages) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.groqApiKey}`,
    },
    body: JSON.stringify({
      model: config.groqModel,
      messages,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Falha ao consultar IA: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim() || 'Sem resposta da IA.'
}

export async function generateAssistantReply(history) {
  const userMessages = history.map(({ role, content }) => ({ role, content }))
  const latestMessage = userMessages.at(-1)?.content || ''

  if (!config.groqApiKey) {
    return buildFallbackReply(latestMessage)
  }

  return requestGroqReply([
    {
      role: 'system',
      content:
        'Voce e um assistente util para um chatbot web com backend Node, Express e MongoDB. Responda de forma clara e direta.',
    },
    ...userMessages,
  ])
}
