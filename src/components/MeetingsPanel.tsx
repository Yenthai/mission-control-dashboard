import { useEffect, useState } from 'react'

type BackendMeeting = {
  id: string
  time: string
  title: string
  link: string
}

export default function MeetingsPanel() {
  const [meetings, setMeetings] = useState<BackendMeeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/meetings')
      .then((response) => {
        if (!response.ok) throw new Error('Kunde inte hämta möten')
        return response.json()
      })
      .then((data: BackendMeeting[]) => {
        setMeetings(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Kunde inte hämta möten')
        setLoading(false)
      })
  }, [])

  return (
    <article className="card support-card">
      <div className="section-head">
        <div>
          <p className="eyebrow">Möten</p>
          <h2>Dagens möten</h2>
        </div>
      </div>

      {loading && <p>Laddar möten...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <div className="mini-list short-list">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="mini-card no-check note-card">
              <div className="grow">
                <h3>{meeting.time} — {meeting.title}</h3>
                <div className="mini-actions">
                  <a href={meeting.link} target="_blank" rel="noreferrer">
                    Öppna möte
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}
