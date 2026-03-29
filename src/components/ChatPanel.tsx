import ChatMessageList from './ChatMessageList'
import ChatComposer from './ChatComposer'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type ChatPanelProps = {
  isOpen: boolean
  messages: ChatMessage[]
  draft: string
  isLoading: boolean
  error: string
  onClose: () => void
  onDraftChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export default function ChatPanel({
  isOpen,
  messages,
  draft,
  isLoading,
  error,
  onClose,
  onDraftChange,
  onSubmit,
}: ChatPanelProps) {
  return (
    <aside className={`chat-panel ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
      <div className="chat-panel-header">
        <div>
          <p className="eyebrow">AI-assistent</p>
          <h2>Hej Yen, vad vill du ha hjälp med idag?</h2>
        </div>
        <button type="button" className="chat-close-button" onClick={onClose}>
          Stäng
        </button>
      </div>

      <div className="chat-panel-body">
        <ChatMessageList messages={messages} isLoading={isLoading} />
        {error && <p className="chat-error-message">{error}</p>}
      </div>

      <ChatComposer value={draft} onChange={onDraftChange} onSubmit={onSubmit} isLoading={isLoading} />
    </aside>
  )
}
