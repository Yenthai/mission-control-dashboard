type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type ChatMessageListProps = {
  messages: ChatMessage[]
  isLoading: boolean
}

export default function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="chat-empty-state">
        <p className="eyebrow">AI-assistent</p>
        <h3>Hej Yen, vad vill du ha hjälp med idag?</h3>
        <p>Jag kan hjälpa dig med idéer, formuleringar, planering och vanliga frågor direkt här i dashboarden.</p>
      </div>
    )
  }

  return (
    <div className="chat-message-list">
      {messages.map((message) => (
        <article key={message.id} className={`chat-message ${message.role}`}>
          <span className="chat-message-role">{message.role === 'user' ? 'Du' : 'AI'}</span>
          <p>{message.content}</p>
        </article>
      ))}

      {isLoading && (
        <article className="chat-message assistant loading">
          <span className="chat-message-role">AI</span>
          <p>Skriver svar...</p>
        </article>
      )}
    </div>
  )
}
