import { useEffect, useState } from 'react'

type MailItem = {
  id: string
  threadId: string
  from: string
  subject: string
  date: string
  timestamp: number
  snippet: string
  isUnread: boolean
}

type MailPanelProps = {
  onOpenMail?: (mail: MailItem) => void
  compact?: boolean
}

export default function MailPanel({ onOpenMail, compact = false }: MailPanelProps) {
  const [mails, setMails] = useState<MailItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastFetched, setLastFetched] = useState<Date | null>(null)

  const fetchMails = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/mail?action=unread')
      const data = await response.json()

      if (data.success) {
        setMails(data.mails)
        setLastFetched(new Date())
      } else {
        setError(data.error || 'Kunde inte hämta mail')
      }
    } catch (err) {
      setError('Något gick fel vid hämtning av mail')
      console.error('Mail fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMails()

    // Auto-uppdatering var 5:e minut
    const interval = setInterval(fetchMails, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = (e: React.MouseEvent) => {
    e.preventDefault()
    fetchMails()
  }

  const handleMailClick = (mail: MailItem) => {
    if (onOpenMail) {
      onOpenMail(mail)
    } else {
      // Fallback: öppna i Gmail
      window.open(`https://mail.google.com/mail/#inbox/${mail.id}`, '_blank')
    }
  }

  const formatFrom = (from: string) => {
    // Försök extrahera namn från "Namn <email@domain.com>"
    const match = from.match(/^(.+?)\s*</)
    return match ? match[1].trim() : from.split('@')[0]
  }

  if (loading && mails.length === 0) {
    return (
      <article className={`card shell-panel ${compact ? 'compact-mail-panel' : ''}`}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Inkorg</p>
            <h2>Olästa mail</h2>
          </div>
          <button type="button" className="refresh-btn" onClick={handleRefresh} disabled>
            Laddar...
          </button>
        </div>
        <div className="mail-loading">
          <p>Hämtar dina olästa mail...</p>
        </div>
      </article>
    )
  }

  if (error && mails.length === 0) {
    return (
      <article className={`card shell-panel ${compact ? 'compact-mail-panel' : ''}`}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Inkorg</p>
            <h2>Olästa mail</h2>
          </div>
          <button type="button" className="refresh-btn" onClick={handleRefresh}>
            Försök igen
          </button>
        </div>
        <div className="mail-error">
          <p>{error}</p>
        </div>
      </article>
    )
  }

  return (
    <article className={`card shell-panel ${compact ? 'compact-mail-panel' : ''}`}>
      <div className="section-head">
        <div>
          <p className="eyebrow">Inkorg</p>
          <h2>Olästa mail {mails.length > 0 && `(${mails.length})`}</h2>
        </div>
        <div className="mail-actions">
          {lastFetched && (
            <span className="last-updated">
              Uppdaterad: {lastFetched.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button type="button" className="refresh-btn" onClick={handleRefresh} disabled={loading}>
            {loading ? '...' : '↻'}
          </button>
        </div>
      </div>

      {mails.length === 0 ? (
        <div className="mail-empty">
          <p>🎉 Ingen oläst mail just nu!</p>
        </div>
      ) : (
        <ul className="mail-list">
          {mails.map((mail) => (
            <li
              key={mail.id}
              className={`mail-item ${mail.isUnread ? 'unread' : ''}`}
              onClick={() => handleMailClick(mail)}
            >
              <div className="mail-main">
                <div className="mail-from">{formatFrom(mail.from)}</div>
                <div className="mail-subject">{mail.subject}</div>
              </div>
              <div className="mail-meta">
                <div className="mail-date">{mail.date}</div>
                {mail.isUnread && <span className="unread-indicator" title="Oläst" />}
              </div>
              {!compact && mail.snippet && (
                <div className="mail-snippet">{mail.snippet}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
