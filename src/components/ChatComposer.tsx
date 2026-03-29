type ChatComposerProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
}

export default function ChatComposer({ value, onChange, onSubmit, isLoading }: ChatComposerProps) {
  return (
    <form className="chat-composer" onSubmit={onSubmit}>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Skriv till AI-assistenten..."
        rows={3}
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading || !value.trim()}>
        {isLoading ? 'Skickar...' : 'Skicka'}
      </button>
    </form>
  )
}
