type ChatComposerProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
}

export default function ChatComposer({ value, onChange, onSubmit, isLoading }: ChatComposerProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <form className="chat-composer" onSubmit={onSubmit}>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Skriv till AI-assistenten..."
        rows={3}
        disabled={isLoading}
        enterKeyHint="send"
      />
      <button type="submit" disabled={isLoading || !value.trim()}>
        {isLoading ? 'Skickar...' : 'Skicka'}
      </button>
    </form>
  )
}
