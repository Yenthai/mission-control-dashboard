import { useEffect, useState, useMemo } from 'react'
import { motion } from 'motion/react'

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

type MailFilter = 'alla' | 'olästa' | 'lästa'

type MailPanelProps = {
  onOpenMail?: (mail: MailItem) => void
  compact?: boolean
  showFilters?: boolean
}

export default function MailPanel({ onOpenMail, compact = false, showFilters = false }: MailPanelProps) {
  const [mails, setMails] = useState<MailItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastFetched, setLastFetched] = useState<Date | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<MailFilter>('olästa')

  const fetchMails = async () => {
    try {
      setLoading(true)
      setError('')

      // Försök först med API (lokal server)
      let response: Response
      try {
        response = await fetch('/api/mail?action=unread', { 
          signal: AbortSignal.timeout(5000) 
        })
      } catch (fetchError) {
        // Fallback: fetcha direkt från Vercel API om lokal server inte finns
        response = await fetch('https://mission-control-dashboard-ten.vercel.app/api/mail?action=unread')
      }

      const data = await response.json()

      if (data.success) {
        setMails(data.mails)
        setLastFetched(new Date())
      } else {
        setError(data.error || 'Kunde inte hämta mail')
      }
    } catch (err) {
      setError('Något gick fel vid hämtning av mail. Säkerställ att backend-servern körs.')
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

  // Filtrera och sök i mail
  const filteredMails = useMemo(() => {
    let result = mails

    // Apply filter (olästa/lästa/all)
    if (filter === 'olästa') {
      result = result.filter(m => m.isUnread)
    } else if (filter === 'lästa') {
      result = result.filter(m => !m.isUnread)
    }
    // 'alla' visar allt

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(m =>
        m.subject.toLowerCase().includes(query) ||
        m.from.toLowerCase().includes(query) ||
        m.snippet.toLowerCase().includes(query)
      )
    }

    return result
  }, [mails, filter, searchQuery])

  if (loading && mails.length === 0) {
    return (
      <article className={`card shell-panel ${compact ? 'compact-mail-panel' : ''}`}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Inkorg</p>
            <h2>Mail</h2>
          </div>
          <button type="button" className="refresh-btn" onClick={handleRefresh} disabled>
            Laddar...
          </button>
        </div>
        <div className="mail-loading">
          <p>Hämtar dina mail...</p>
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
            <h2>Mail</h2>
          </div>
          <button type="button" className="refresh-btn" onClick={handleRefresh}>
            Försök igen
          </button>
        </div>
        <div className="mail-error">
          <p>{error}</p>
          <p style={{ fontSize: '0.85rem', marginTop: '8px', opacity: 0.8 }}>
            Tips: Starta backend-servern med <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: '4px' }}>node server/index.js</code>
          </p>
        </div>
      </article>
    )
  }

  return (
    <article className={`card shell-panel ${compact ? 'compact-mail-panel' : ''}`}>
      <div className="section-head">
        <div>
          <p className="eyebrow">Inkorg</p>
          <h2>Mail {mails.length > 0 && `(${mails.length})`}</h2>
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

      {/* Search and filters - only show on full view */}
      {showFilters && (
        <div className="mail-controls">
          <div className="mail-search">
            <input
              type="text"
              placeholder="Sök i ämne, avsändare..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mail-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="mail-search-clear"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          <div className="mail-filter-group">
            <button
              type="button"
              className={`mail-filter-btn ${filter === 'alla' ? 'active' : ''}`}
              onClick={() => setFilter('alla')}
            >
              Alla
            </button>
            <button
              type="button"
              className={`mail-filter-btn ${filter === 'olästa' ? 'active' : ''}`}
              onClick={() => setFilter('olästa')}
            >
              Olästa
            </button>
            <button
              type="button"
              className={`mail-filter-btn ${filter === 'lästa' ? 'active' : ''}`}
              onClick={() => setFilter('lästa')}
            >
              Lästa
            </button>
          </div>
        </div>
      )}

      {filteredMails.length === 0 ? (
        <div className="mail-empty">
          {searchQuery || filter !== 'olästa' ? (
            <p>Inga mail matchar din sökning eller filter.</p>
          ) : (
            <p>🎉 Ingen oläst mail just nu!</p>
          )}
        </div>
      ) : (
        <ul className="mail-list">
          {filteredMails.map((mail) => (
            <motion.li
              key={mail.id}
              className={`mail-item ${mail.isUnread ? 'unread' : ''}`}
              onClick={() => handleMailClick(mail)}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.15 }}
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
            </motion.li>
          ))}
        </ul>
      )}
    </article>
  )
}
