import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

const SYSTEM_PROMPT = `You are a helpful product safety assistant for Clean Shopper, an app that helps ingredient-aware consumers make safer purchasing decisions for home and personal care products.

You have access to a curated database of products that have been assessed for ingredient safety. Each product has a safety rating based on EWG Skin Deep ingredient data:
- "clean": Safe ingredients with no known harmful components
- "mixed": Some concerning ingredients worth noting
- "avoid": Contains ingredients with significant safety concerns

Your role:
1. Answer questions about specific products or ingredients from the database
2. Recommend safer alternatives when users ask
3. Explain ingredient safety in plain, accessible language
4. Help users find products matching criteria they care about (e.g., fragrance-free, sulfate-free, paraben-free, EWG verified)
5. Compare products and explain why one might be safer than another

Available products in the database:
{PRODUCTS}

Guidelines:
- Reference specific products from the database when relevant to the user's question
- Be specific — name actual ingredients and explain why they're rated as they are
- When recommending products, prioritize "clean" rated ones
- Keep responses concise and easy to scan — use short paragraphs or bullet points where helpful
- Be honest: you're providing ingredient safety guidance, not medical advice
- If asked about something unrelated to product safety or shopping, politely redirect`

export async function* streamChatMessage(messages, products) {
  const productsContext =
    products.length > 0
      ? products
          .map(
            (p) =>
              `• ${p.name} by ${p.brand} [${p.category}] — Rating: ${p.rating} — ${p.summary}`
          )
          .join('\n')
      : 'No products currently in database.'

  const systemPrompt = SYSTEM_PROMPT.replace('{PRODUCTS}', productsContext)

  // API requires conversation to start with a user message — drop any leading assistant messages
  const firstUserIdx = messages.findIndex((m) => m.role === 'user')
  const apiMessages =
    firstUserIdx >= 0
      ? messages.slice(firstUserIdx).map((m) => ({ role: m.role, content: m.content }))
      : []

  if (apiMessages.length === 0) return

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: apiMessages,
  })

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      yield chunk.delta.text
    }
  }
}
