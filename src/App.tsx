import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type AgendaItem = {
  id: number
  time: string
  title: string
  detail: string
  important: boolean
}

type TodoStatus = 'Klar' | 'Pågår' | 'Nästa'

type TodoItem = {
  id: number
  title: string
  status: TodoStatus
  important: boolean
}

type MailPriority = 'Hög' | 'Medel' | 'Låg'

type MailItem = {
  id: number
  sender: string
  subject: string
  priority: MailPriority
}

type MeetingItem = {
  id: number
  time: string
  name: string
  attendees: string
  important: boolean
}

const storageKeys = {
  agenda: 'mission-control-agenda',
  todos: 'mission-control-todos',
  mails: 'mission-control-mails',
  meetings: 'mission-control-meetings',
}

const googleCalendarEmbedUrl =
  'https://calendar.google.com/calendar/embed?src=yen.thairakic%40gmail.com&ctz=UTC'

const defaultAgenda: AgendaItem[] = [
  { id: 1, time: '09:00', title: 'Planera dagen', detail: 'Gå igenom mål, dagens viktigaste uppgifter och tidblock.', important: true },
  { id: 2, time: '10:30', title: 'Kunduppföljning', detail: 'Svar på leads och prioritera nästa steg.', important: true },
  { id: 3, time: '13:00', title: 'Admin + mail', detail: 'Rensa inkorg och svara på viktiga trådar.', important: false },
  { id: 4, time: '15:00', title: 'Projektfokus', detail: 'Arbeta ostört med pågående dashboard och struktur.', important: false },
]

const defaultTodos: TodoItem[] = [
  { id: 1, title: 'Skicka uppföljning till nya leads', status: 'Pågår', important: true },
  { id: 2, title: 'Förbered morgondagens mötespunkter', status: 'Nästa', important: true },
  { id: 3, title: 'Rensa inkorg och markera viktiga svar', status: 'Nästa', important: false },
  { id: 4, title: 'Kontrollera veckans deadlines', status: 'Klar', important: false },
]

const defaultMails: MailItem[] = [
  { id: 1, sender: 'Filip', subject: 'Snabb avstämning om Telestore', priority: 'Hög' },
  { id: 2, sender: 'Kundkontakt', subject: 'Återkoppling på offert', priority: 'Hög' },
  { id: 3, sender: 'Samarbetspartner', subject: 'Uppdatering om nästa steg', priority: 'Medel' },
]

const defaultMeetings: MeetingItem[] = [
  { id: 1, time: '09:30', name: 'Morgoncheck-in', attendees: 'Yen + team', important: false },
  { id: 2, time: '11:00', name: 'Leadgenomgång', attendees: 'Yen + Filip', important: true },
  { id: 3, time: '14:00', name: 'Kundmöte', attendees: 'Yen + extern kontakt', important: true },
]

const readStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback

  try {
    const item = window.localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : fallback
  } catch {
    return fallback
  }
}

function App() {
  const [agenda, setAgenda] = useState<AgendaItem[]>(() => readStorage(storageKeys.agenda, defaultAgenda))
  const [todos, setTodos] = useState<TodoItem[]>(() => readStorage(storageKeys.todos, defaultTodos))
  const [mails, setMails] = useState<MailItem[]>(() => readStorage(storageKeys.mails, defaultMails))
  const [meetings, setMeetings] = useState<MeetingItem[]>(() => readStorage(storageKeys.meetings, defaultMeetings))

  const [todoInput, setTodoInput] = useState('')
  const [todoStatus, setTodoStatus] = useState<TodoStatus>('Nästa')
  const [todoImportant, setTodoImportant] = useState(false)

  const [mailSender, setMailSender] = useState('')
  const [mailSubject, setMailSubject] = useState('')
  const [mailPriority, setMailPriority] = useState<MailPriority>('Medel')

  const [agendaTime, setAgendaTime] = useState('')
  const [agendaTitle, setAgendaTitle] = useState('')
  const [agendaDetail, setAgendaDetail] = useState('')
  const [agendaImportant, setAgendaImportant] = useState(false)

  const [meetingTime, setMeetingTime] = useState('')
  const [meetingName, setMeetingName] = useState('')
  const [meetingAttendees, setMeetingAttendees] = useState('')
  const [meetingImportant, setMeetingImportant] = useState(false)

  const [editingAgendaId, setEditingAgendaId] = useState<number | null>(null)
  const [editingMeetingId, setEditingMeetingId] = useState<number | null>(null)
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null)
  const [editingMailId, setEditingMailId] = useState<number | null>(null)

  useEffect(() => {
    window.localStorage.setItem(storageKeys.agenda, JSON.stringify(agenda))
  }, [agenda])

  useEffect(() => {
    window.localStorage.setItem(storageKeys.todos, JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    window.localStorage.setItem(storageKeys.mails, JSON.stringify(mails))
  }, [mails])

  useEffect(() => {
    window.localStorage.setItem(storageKeys.meetings, JSON.stringify(meetings))
  }, [meetings])

  const sortedAgenda = useMemo(() => [...agenda].sort((a, b) => a.time.localeCompare(b.time)), [agenda])
  const sortedMeetings = useMemo(() => [...meetings].sort((a, b) => a.time.localeCompare(b.time)), [meetings])
  const topThree = useMemo(() => todos.filter((todo) => todo.status !== 'Klar').slice(0, 3), [todos])
  const completedTodos = useMemo(() => todos.filter((todo) => todo.status === 'Klar').length, [todos])
  const activeTodos = useMemo(() => todos.filter((todo) => todo.status !== 'Klar').length, [todos])
  const highPriorityMails = useMemo(() => mails.filter((mail) => mail.priority === 'Hög').length, [mails])
  const importantMeetings = useMemo(() => meetings.filter((meeting) => meeting.important).length, [meetings])
  const progressPercent = todos.length > 0 ? Math.round((completedTodos / todos.length) * 100) : 0
  const focusMessage = activeTodos <= 2 ? 'Lugn rytm idag' : progressPercent >= 50 ? 'Bra tempo idag' : 'Välj ett fokusblock och börja där'

  const timeline = useMemo(
    () => [
      ...sortedAgenda.map((item) => ({ ...item, kind: 'agenda' as const })),
      ...sortedMeetings.map((item) => ({ ...item, kind: 'meeting' as const })),
    ].sort((a, b) => a.time.localeCompare(b.time)),
    [sortedAgenda, sortedMeetings],
  )

  const handleAddTodo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!todoInput.trim()) return
    setTodos((current) => [{ id: Date.now(), title: todoInput.trim(), status: todoStatus, important: todoImportant }, ...current])
    setTodoInput('')
    setTodoStatus('Nästa')
    setTodoImportant(false)
  }

  const handleAddMail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!mailSender.trim() || !mailSubject.trim()) return
    setMails((current) => [{ id: Date.now(), sender: mailSender.trim(), subject: mailSubject.trim(), priority: mailPriority }, ...current])
    setMailSender('')
    setMailSubject('')
    setMailPriority('Medel')
  }

  const handleAddAgenda = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!agendaTime.trim() || !agendaTitle.trim()) return
    setAgenda((current) => [{ id: Date.now(), time: agendaTime.trim(), title: agendaTitle.trim(), detail: agendaDetail.trim() || 'Ingen extra beskrivning än.', important: agendaImportant }, ...current].sort((a, b) => a.time.localeCompare(b.time)))
    setAgendaTime('')
    setAgendaTitle('')
    setAgendaDetail('')
    setAgendaImportant(false)
  }

  const handleAddMeeting = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!meetingTime.trim() || !meetingName.trim()) return
    setMeetings((current) => [{ id: Date.now(), time: meetingTime.trim(), name: meetingName.trim(), attendees: meetingAttendees.trim() || 'Deltagare ej angivna än.', important: meetingImportant }, ...current].sort((a, b) => a.time.localeCompare(b.time)))
    setMeetingTime('')
    setMeetingName('')
    setMeetingAttendees('')
    setMeetingImportant(false)
  }

  const toggleTodoStatus = (id: number) => {
    setTodos((current) => current.map((todo) => {
      if (todo.id !== id) return todo
      if (todo.status === 'Nästa') return { ...todo, status: 'Pågår' }
      if (todo.status === 'Pågår') return { ...todo, status: 'Klar' }
      return { ...todo, status: 'Nästa' }
    }))
  }

  const toggleTodoImportant = (id: number) => setTodos((current) => current.map((todo) => (todo.id === id ? { ...todo, important: !todo.important } : todo)))
  const toggleAgendaImportant = (id: number) => setAgenda((current) => current.map((item) => (item.id === id ? { ...item, important: !item.important } : item)))
  const toggleMeetingImportant = (id: number) => setMeetings((current) => current.map((item) => (item.id === id ? { ...item, important: !item.important } : item)))

  const removeMail = (id: number) => setMails((current) => current.filter((mail) => mail.id !== id))
  const removeAgenda = (id: number) => setAgenda((current) => current.filter((item) => item.id !== id))
  const removeMeeting = (id: number) => setMeetings((current) => current.filter((meeting) => meeting.id !== id))

  const updateAgendaItem = (id: number, field: keyof Omit<AgendaItem, 'id'>, value: string | boolean) => setAgenda((current) => current.map((item) => (item.id === id ? { ...item, [field]: value } : item)).sort((a, b) => a.time.localeCompare(b.time)))
  const updateMeetingItem = (id: number, field: keyof Omit<MeetingItem, 'id'>, value: string | boolean) => setMeetings((current) => current.map((item) => (item.id === id ? { ...item, [field]: value } : item)).sort((a, b) => a.time.localeCompare(b.time)))
  const updateTodoItem = (id: number, value: string) => setTodos((current) => current.map((item) => (item.id === id ? { ...item, title: value } : item)))
  const updateMailItem = (id: number, field: keyof Omit<MailItem, 'id'>, value: string) => setMails((current) => current.map((item) => (item.id === id ? { ...item, [field]: value } : item)))

  return (
    <main className="dashboard-shell">
      <section className="overview-panel card">
        <div className="overview-copy">
          <p className="eyebrow">Mission control</p>
          <h1>Din dashboard, omgjord från grunden</h1>
          <p className="lede">Mindre brus, tydligare fokus och ett bättre flöde för dagen. Här ser du först vad som är viktigast — resten ligger där du behöver det.</p>
        </div>

        <div className="stats-grid">
          <article className="stat-card accent-peach">
            <span>Uppgifter kvar</span>
            <strong>{activeTodos}</strong>
            <p>{completedTodos} klara hittills</p>
          </article>
          <article className="stat-card accent-sand">
            <span>Viktiga mail</span>
            <strong>{highPriorityMails}</strong>
            <p>Redo att besvaras</p>
          </article>
          <article className="stat-card accent-lilac">
            <span>Viktiga möten</span>
            <strong>{importantMeetings}</strong>
            <p>{meetings.length} möten idag</p>
          </article>
        </div>
      </section>

      <section className="main-layout">
        <article className="card focus-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Fokus</p>
              <h2>Dagens top 3</h2>
            </div>
            <span className="percentage-pill">{progressPercent}%</span>
          </div>

          <div className="focus-summary">
            <strong>{focusMessage}</strong>
            <p>{completedTodos} av {todos.length} uppgifter är klara</p>
          </div>

          <div className="progress-bar"><div className="progress-value" style={{ width: `${progressPercent}%` }} /></div>

          <div className="focus-list">
            {topThree.map((todo, index) => (
              <div key={todo.id} className={`focus-item ${todo.important ? 'is-important' : ''}`}>
                <div className="focus-number">{index + 1}</div>
                <div className="grow">
                  <h3>{todo.title}</h3>
                  <p>{todo.status}</p>
                </div>
                {todo.important && <span className="badge badge-strong">Viktig</span>}
              </div>
            ))}
          </div>
        </article>

        <article className="card timeline-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Plan</p>
              <h2>Dagens flöde</h2>
            </div>
          </div>

          <div className="timeline-list">
            {timeline.map((item) => (
              <div key={`${item.kind}-${item.id}`} className="timeline-row">
                <div className="timeline-time">{item.time}</div>
                <div className="timeline-dot" />
                <div className="timeline-card">
                  <div className="timeline-top">
                    <div>
                      <h3>{item.kind === 'agenda' ? item.title : item.name}</h3>
                      <p>{item.kind === 'agenda' ? item.detail : item.attendees}</p>
                    </div>
                    <div className="timeline-badges">
                      <span className="badge">{item.kind === 'agenda' ? 'Agenda' : 'Möte'}</span>
                      {item.important && <span className="badge badge-strong">Viktig</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="side-stack">
          <article className="card manager-card">
            <div className="section-head">
              <div>
                <p className="eyebrow">Att göra</p>
                <h2>Uppgifter</h2>
              </div>
            </div>

            <form className="compact-form" onSubmit={handleAddTodo}>
              <input value={todoInput} onChange={(event) => setTodoInput(event.target.value)} placeholder="Ny uppgift" />
              <select value={todoStatus} onChange={(event) => setTodoStatus(event.target.value as TodoStatus)}>
                <option>Nästa</option>
                <option>Pågår</option>
                <option>Klar</option>
              </select>
              <label className="checkbox-row"><input type="checkbox" checked={todoImportant} onChange={(event) => setTodoImportant(event.target.checked)} /> Viktig</label>
              <button type="submit">Lägg till</button>
            </form>

            <div className="mini-list">
              {todos.map((item) => (
                <div key={item.id} className="mini-card">
                  <button className="check-toggle" type="button" aria-label="Byt status" onClick={() => toggleTodoStatus(item.id)} />
                  <div className="grow">
                    {editingTodoId === item.id ? (
                      <input className="edit-input" value={item.title} onChange={(event) => updateTodoItem(item.id, event.target.value)} />
                    ) : (
                      <>
                        <div className="mini-top">
                          <h3>{item.title}</h3>
                          <span className={`badge status-${item.status.toLowerCase()}`}>{item.status}</span>
                        </div>
                        <div className="mini-actions">
                          <button className="text-button" type="button" onClick={() => toggleTodoImportant(item.id)}>{item.important ? 'Avmarkera' : 'Viktig'}</button>
                          <button className="text-button" type="button" onClick={() => setEditingTodoId(editingTodoId === item.id ? null : item.id)}>{editingTodoId === item.id ? 'Spara' : 'Redigera'}</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="card manager-card">
            <div className="section-head">
              <div>
                <p className="eyebrow">Inkorg</p>
                <h2>Mail</h2>
              </div>
            </div>

            <form className="compact-form" onSubmit={handleAddMail}>
              <input value={mailSender} onChange={(event) => setMailSender(event.target.value)} placeholder="Från" />
              <input value={mailSubject} onChange={(event) => setMailSubject(event.target.value)} placeholder="Ämne" />
              <select value={mailPriority} onChange={(event) => setMailPriority(event.target.value as MailPriority)}>
                <option>Hög</option>
                <option>Medel</option>
                <option>Låg</option>
              </select>
              <button type="submit">Lägg till</button>
            </form>

            <div className="mini-list">
              {mails.map((mail) => (
                <div key={mail.id} className="mini-card no-check">
                  <div className="grow">
                    {editingMailId === mail.id ? (
                      <div className="edit-stack">
                        <input className="edit-input" value={mail.subject} onChange={(event) => updateMailItem(mail.id, 'subject', event.target.value)} />
                        <input className="edit-input" value={mail.sender} onChange={(event) => updateMailItem(mail.id, 'sender', event.target.value)} />
                      </div>
                    ) : (
                      <>
                        <div className="mini-top">
                          <div>
                            <h3>{mail.subject}</h3>
                            <p>{mail.sender}</p>
                          </div>
                          <span className={`badge priority-${mail.priority.toLowerCase()}`}>{mail.priority}</span>
                        </div>
                        <div className="mini-actions">
                          <button className="text-button" type="button" onClick={() => setEditingMailId(editingMailId === mail.id ? null : mail.id)}>{editingMailId === mail.id ? 'Spara' : 'Redigera'}</button>
                          <button className="text-button danger" type="button" onClick={() => removeMail(mail.id)}>Ta bort</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>

      <section className="bottom-layout">
        <article className="card split-card">
          <div className="split-header">
            <div>
              <p className="eyebrow">Agenda</p>
              <h2>Lägg till och justera</h2>
            </div>
          </div>

          <form className="compact-form" onSubmit={handleAddAgenda}>
            <input value={agendaTime} onChange={(event) => setAgendaTime(event.target.value)} placeholder="Tid" />
            <input value={agendaTitle} onChange={(event) => setAgendaTitle(event.target.value)} placeholder="Vad ska göras?" />
            <input value={agendaDetail} onChange={(event) => setAgendaDetail(event.target.value)} placeholder="Kort beskrivning" />
            <label className="checkbox-row"><input type="checkbox" checked={agendaImportant} onChange={(event) => setAgendaImportant(event.target.checked)} /> Viktig</label>
            <button type="submit">Lägg till</button>
          </form>

          <div className="mini-list">
            {sortedAgenda.map((item) => (
              <div key={item.id} className="mini-card no-check">
                {editingAgendaId === item.id ? (
                  <div className="edit-stack grow">
                    <input className="edit-input" value={item.time} onChange={(event) => updateAgendaItem(item.id, 'time', event.target.value)} />
                    <input className="edit-input" value={item.title} onChange={(event) => updateAgendaItem(item.id, 'title', event.target.value)} />
                    <input className="edit-input" value={item.detail} onChange={(event) => updateAgendaItem(item.id, 'detail', event.target.value)} />
                    <div className="mini-actions">
                      <button className="text-button" type="button" onClick={() => setEditingAgendaId(null)}>Spara</button>
                      <button className="text-button danger" type="button" onClick={() => removeAgenda(item.id)}>Ta bort</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="time-chip">{item.time}</div>
                    <div className="grow">
                      <div className="mini-top">
                        <div>
                          <h3>{item.title}</h3>
                          <p>{item.detail}</p>
                        </div>
                        {item.important && <span className="badge badge-strong">Viktig</span>}
                      </div>
                      <div className="mini-actions">
                        <button className="text-button" type="button" onClick={() => toggleAgendaImportant(item.id)}>{item.important ? 'Avmarkera' : 'Viktig'}</button>
                        <button className="text-button" type="button" onClick={() => setEditingAgendaId(item.id)}>Redigera</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </article>

        <article className="card split-card">
          <div className="split-header">
            <div>
              <p className="eyebrow">Möten</p>
              <h2>Snabb överblick</h2>
            </div>
          </div>

          <form className="compact-form" onSubmit={handleAddMeeting}>
            <input value={meetingTime} onChange={(event) => setMeetingTime(event.target.value)} placeholder="Tid" />
            <input value={meetingName} onChange={(event) => setMeetingName(event.target.value)} placeholder="Mötesnamn" />
            <input value={meetingAttendees} onChange={(event) => setMeetingAttendees(event.target.value)} placeholder="Deltagare" />
            <label className="checkbox-row"><input type="checkbox" checked={meetingImportant} onChange={(event) => setMeetingImportant(event.target.checked)} /> Viktig</label>
            <button type="submit">Lägg till</button>
          </form>

          <div className="mini-list">
            {sortedMeetings.map((meeting) => (
              <div key={meeting.id} className="mini-card no-check">
                {editingMeetingId === meeting.id ? (
                  <div className="edit-stack grow">
                    <input className="edit-input" value={meeting.time} onChange={(event) => updateMeetingItem(meeting.id, 'time', event.target.value)} />
                    <input className="edit-input" value={meeting.name} onChange={(event) => updateMeetingItem(meeting.id, 'name', event.target.value)} />
                    <input className="edit-input" value={meeting.attendees} onChange={(event) => updateMeetingItem(meeting.id, 'attendees', event.target.value)} />
                    <div className="mini-actions">
                      <button className="text-button" type="button" onClick={() => setEditingMeetingId(null)}>Spara</button>
                      <button className="text-button danger" type="button" onClick={() => removeMeeting(meeting.id)}>Ta bort</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="time-chip">{meeting.time}</div>
                    <div className="grow">
                      <div className="mini-top">
                        <div>
                          <h3>{meeting.name}</h3>
                          <p>{meeting.attendees}</p>
                        </div>
                        {meeting.important && <span className="badge badge-strong">Viktig</span>}
                      </div>
                      <div className="mini-actions">
                        <button className="text-button" type="button" onClick={() => toggleMeetingImportant(meeting.id)}>{meeting.important ? 'Avmarkera' : 'Viktig'}</button>
                        <button className="text-button" type="button" onClick={() => setEditingMeetingId(meeting.id)}>Redigera</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </article>

        <article className="card calendar-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Kalender</p>
              <h2>Google Kalender</h2>
            </div>
          </div>

          <div className="calendar-wrap">
            <iframe src={googleCalendarEmbedUrl} title="Google Kalender" className="calendar-embed" frameBorder="0" scrolling="no" />
          </div>
        </article>
      </section>
    </main>
  )
}

export default App
