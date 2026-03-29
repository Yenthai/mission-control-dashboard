type ChatTriggerProps = {
  isOpen: boolean
  onToggle: () => void
}

export default function ChatTrigger({ isOpen, onToggle }: ChatTriggerProps) {
  return (
    <button
      type="button"
      className={`chat-trigger ${isOpen ? 'active' : ''}`}
      onClick={onToggle}
      aria-label={isOpen ? 'Stäng AI-chatten' : 'Öppna AI-chatten'}
      aria-expanded={isOpen}
    >
      <span className="chat-trigger-background" />
      <span className="chat-trigger-bubble" aria-hidden="true">
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path className="bubble" d="M29 33C29 27.4772 33.4772 23 39 23H61C66.5228 23 71 27.4772 71 33V49C71 54.5228 66.5228 59 61 59H49L39 67V59H39C33.4772 59 29 54.5228 29 49V33Z" fill="currentColor" />
          <path className="line line1" d="M40 37H60" />
          <path className="line line2" d="M40 45H56" />
          <circle className="circle" cx="63" cy="61" r="6" />
        </svg>
      </span>
    </button>
  )
}
