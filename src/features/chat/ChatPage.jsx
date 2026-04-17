import { useState, useEffect, useRef } from 'react'
import Button from '../../components/Button'
import { fetchProducts } from '../../lib/api/products'
import { streamChatMessage } from '../../lib/api/chat'

const WELCOME_MESSAGE = {
  role: 'assistant',
  content:
    "Hi! I'm your Clean Shopper AI assistant. Ask me about product safety, specific ingredients to look out for, or tell me what you're looking for and I'll recommend safer options from our product database.",
}

// ─── Message bubbles ──────────────────────────────────────────────────────────

function UserBubble({ content }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-lg bg-accent text-white rounded-radius-lg px-space-md py-space-md text-body font-jost whitespace-pre-wrap">
        {content}
      </div>
    </div>
  )
}

function AssistantBubble({ content, isStreaming = false }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-2xl bg-secondary-cream rounded-radius-lg px-space-md py-space-md text-body font-jost text-neutral-900 shadow-sm whitespace-pre-wrap">
        {content}
        {isStreaming && (
          <span className="inline-block w-0.5 h-4 bg-accent ml-0.5 align-middle animate-pulse" />
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-secondary-cream rounded-radius-lg px-space-md py-space-md shadow-sm flex items-center gap-space-xs">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-radius-full bg-neutral-400 animate-pulse"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Suggested prompts ────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'What fragrance-free products do you have?',
  'Are there any products I should avoid?',
  'Recommend a clean face wash',
  'What ingredients should I avoid in cleaning products?',
]

function SuggestedPrompts({ onSelect }) {
  return (
    <div className="flex flex-wrap gap-space-sm justify-center">
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="text-small font-jost text-accent border border-accent rounded-radius-full px-space-md py-space-xs hover:bg-secondary-sage transition-colors duration-150 focus:outline-none"
        >
          {s}
        </button>
      ))}
    </div>
  )
}

// ─── ChatPage ─────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [products, setProducts] = useState([])
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const cancelledRef = useRef(false)

  // Load product database once for context
  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => {})
  }, [])

  // Scroll to bottom when messages or streaming content updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  async function handleSend(textOverride) {
    const text = (textOverride ?? input).trim()
    if (!text || isLoading) return

    const userMessage = { role: 'user', content: text }
    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setInput('')
    setIsLoading(true)
    setStreamingContent('')
    setError(null)
    cancelledRef.current = false

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      let accumulated = ''
      for await (const chunk of streamChatMessage(nextMessages, products)) {
        if (cancelledRef.current) break
        accumulated += chunk
        setStreamingContent(accumulated)
      }
      if (!cancelledRef.current) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: accumulated },
        ])
      }
    } catch (err) {
      if (!cancelledRef.current) {
        setError(err.message)
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Sorry, something went wrong. ${err.message}`,
          },
        ])
      }
    } finally {
      if (!cancelledRef.current) {
        setStreamingContent('')
        setIsLoading(false)
      }
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleTextareaChange(e) {
    setInput(e.target.value)
    // Auto-grow textarea
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  const showSuggestions = messages.length === 1 // only the welcome message

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto py-space-lg px-space-lg">
        <div className="max-w-screen-md mx-auto flex flex-col gap-space-lg">

          {messages.map((msg, i) =>
            msg.role === 'user' ? (
              <UserBubble key={i} content={msg.content} />
            ) : (
              <AssistantBubble key={i} content={msg.content} />
            )
          )}

          {/* Streaming response */}
          {streamingContent && (
            <AssistantBubble content={streamingContent} isStreaming />
          )}

          {/* Typing indicator before stream starts */}
          {isLoading && !streamingContent && <TypingIndicator />}

          {/* Suggested prompts — shown only before any user message */}
          {showSuggestions && (
            <SuggestedPrompts onSelect={(s) => handleSend(s)} />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-neutral-200 bg-neutral-50 px-space-lg py-space-md shrink-0">
        <div className="max-w-screen-md mx-auto flex items-end gap-space-sm">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about an ingredient, product, or what you're looking for…"
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none bg-neutral-100 border border-neutral-200 rounded-radius-md px-space-md py-space-md text-body font-jost text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary-dark focus:shadow-md transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-y-auto"
            style={{ maxHeight: '160px' }}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            isLoading={isLoading}
          >
            Send
          </Button>
        </div>
        <p className="max-w-screen-md mx-auto mt-space-xs text-micro font-jost text-neutral-400">
          Enter to send · Shift+Enter for new line
        </p>
      </div>

    </div>
  )
}
