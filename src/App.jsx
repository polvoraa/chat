import { useEffect, useRef, useState } from 'react'
import './App.css'
import EnergyOrb from './components/EnergyOrb.jsx'

const emptyComposer = { loading: false, error: '', text: '' }
const isDev = import.meta.env.DEV
const apiBaseUrl = (
  import.meta.env.VITE_API_URL || (isDev ? 'http://localhost:5000' : '')
).replace(/\/$/, '')

function apiUrl(path) {
  if (!apiBaseUrl) {
    throw new Error(
      'VITE_API_URL nao foi configurado no frontend em producao.',
    )
  }

  return `${apiBaseUrl}${path}`
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function App() {
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState('')
  const [messages, setMessages] = useState([])
  const [composer, setComposer] = useState(emptyComposer)
  const [bootError, setBootError] = useState('')
  const messageListRef = useRef(null)

  useEffect(() => {
    async function loadConversations() {
      setBootError('')

      try {
        const response = await fetch(apiUrl('/api/conversations'))
        if (!response.ok) throw new Error('Nao foi possivel carregar conversas.')

        const data = await response.json()
        setConversations(data)
        setActiveConversationId((current) => current || data[0]?._id || '')
      } catch (error) {
        setBootError(error.message)
      }
    }

    loadConversations()
  }, [])

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([])
      return
    }

    async function loadMessages() {
      try {
        const response = await fetch(
          apiUrl(`/api/conversations/${activeConversationId}/messages`),
        )
        if (!response.ok) throw new Error('Nao foi possivel carregar mensagens.')

        const data = await response.json()
        setMessages(data)
      } catch (error) {
        setComposer((current) => ({ ...current, error: error.message }))
      }
    }

    loadMessages()
  }, [activeConversationId])

  useEffect(() => {
    const container = messageListRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
  }, [messages])

  async function createConversation() {
    setComposer((current) => ({ ...current, error: '' }))

    const response = await fetch(apiUrl('/api/conversations'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Nova conversa' }),
    })

    if (!response.ok) {
      throw new Error('Nao foi possivel criar a conversa.')
    }

    const conversation = await response.json()
    setConversations((current) => [conversation, ...current])
    setActiveConversationId(conversation._id)
    setMessages([])
    return conversation
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const content = composer.text.trim()
    if (!content || composer.loading) return

    setComposer((current) => ({ ...current, loading: true, error: '' }))

    try {
      const conversationId = activeConversationId || (await createConversation())._id
      const response = await fetch(
        apiUrl(`/api/conversations/${conversationId}/messages`),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        },
      )

      if (!response.ok) {
        const payload = await response.json()
        throw new Error(payload.error || 'Falha ao enviar a mensagem.')
      }

      const payload = await response.json()
      setMessages((current) => [...current, ...payload.messages])
      setConversations((current) =>
        current
          .map((conversation) =>
            conversation._id === payload.conversation._id
              ? payload.conversation
              : conversation,
          )
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
      )
      setActiveConversationId(payload.conversation._id)
      setComposer(emptyComposer)
    } catch (error) {
      setComposer((current) => ({
        ...current,
        loading: false,
        error: error.message,
      }))
      return
    }

    setComposer(emptyComposer)
  }

  async function handleCreateConversation() {
    try {
      await createConversation()
    } catch (error) {
      setComposer((current) => ({ ...current, error: error.message }))
    }
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">AI</span>
          <div>
            <p className="eyebrow">Zyricon style</p>
            <h1>Nova interface de chatbot</h1>
          </div>
        </div>

        <button className="new-chat" type="button" onClick={handleCreateConversation}>
          Nova conversa
        </button>

        <div className="sidebar-group">
          <p className="eyebrow">Features</p>
          <button type="button" className="nav-item active">
            Chat
          </button>
          <button type="button" className="nav-item">
            Arquivadas
          </button>
          <button type="button" className="nav-item">
            Biblioteca
          </button>
        </div>

        <div className="sidebar-section">
          <p className="eyebrow">Workspaces</p>
          <div className="conversation-list">
            {conversations.length === 0 ? (
              <p className="empty-state">Nenhuma conversa criada ainda.</p>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation._id}
                  type="button"
                  className={
                    conversation._id === activeConversationId
                      ? 'conversation-card active'
                      : 'conversation-card'
                  }
                  onClick={() => setActiveConversationId(conversation._id)}
                >
                  <strong>{conversation.title}</strong>
                  <span>{formatDate(conversation.updatedAt)}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="sidebar-note">
          <p>
            O backend foi preparado para usar API de modelo. Scraping do ChatGPT
            Web nao foi adotado como motor do sistema.
          </p>
        </div>
      </aside>

      <section className="chat-panel">

        <section className="chat-stage">
          <div className="chat-header">
            <div>
              <p className="eyebrow">Backend ativo</p>
              <h2>Ready to Create Something New?</h2>
            </div>
            <div className="header-actions">
              <div className="status-pill">Configuration</div>
              <div className="status-pill">Export</div>
            </div>
          </div>

          <div className="prompt-actions">
            <button type="button" className="prompt-chip">
              Create image
            </button>
            <button type="button" className="prompt-chip">
              Brainstorm
            </button>
            <button type="button" className="prompt-chip">
              Make a plan
            </button>
          </div>

          {bootError ? <div className="alert error">{bootError}</div> : null}

          <div className="message-list" ref={messageListRef}>
            {messages.length === 0 ? (
              <div className="welcome-card">
                <EnergyOrb />
              </div>
            ) : (
              messages.map((message) => (
                <article
                  key={message._id}
                  className={
                    message.role === 'user' ? 'message user-message' : 'message'
                  }
                >
                  <span className="message-role">
                    {message.role === 'user' ? 'Voce' : 'Assistente'}
                  </span>
                  <p>{message.content}</p>
                  <time>{formatDate(message.createdAt)}</time>
                </article>
              ))
            )}
          </div>

          <form className="composer" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="message">
              Mensagem
            </label>
            <textarea
              id="message"
              placeholder="Ask Anything..."
              value={composer.text}
              onChange={(event) =>
                setComposer((current) => ({
                  ...current,
                  text: event.target.value,
                }))
              }
              rows="4"
            />

            <div className="composer-toolbar">
              <span>Attach</span>
              <span>Settings</span>
              <span>Options</span>
            </div>

            <div className="composer-footer">
              <p className="hint">
                Se nao houver chave de IA, o backend responde em modo de fallback.
              </p>
              <button type="submit" disabled={composer.loading}>
                {composer.loading ? 'Enviando...' : 'Enviar'}
              </button>
            </div>

            {composer.error ? <div className="alert error">{composer.error}</div> : null}
          </form>
        </section>
      </section>
    </main>
  )
}

export default App
