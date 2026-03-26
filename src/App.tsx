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

type NoteItem = {
  id: number
  text: string
}

const storageKeys = {
  agenda: 'mission-control-agenda',
  todos: 'mission-control-todos',
  mails: 'mission-control-mails',
  meetings: 'mission-control-meetings',
  notes: 'mission-control-notes',
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

const defaultNotes: NoteItem[] = [
  { id: 1, text: 'Kom ihåg att följa upp högprio-leads före lunch.' },
  { id: 2, text: 'Dubbelkolla mötespunkter inför Filip-avstämningen.' },
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
  const [mails] = useState<MailItem[]>(() => readStorage(storageKeys.mails, defaultMails))
  const [meetings, setMeetings] = useState<MeetingItem[]>(() => readStorage(storageKeys.meetings, defaultMeetings))
  const [notes, setNotes] = useState<NoteItem[]>(() => readStorage(storageKeys.notes, defaultNotes))

  const [todoInput, setTodoInput] = useState('')
  const [todoStatus, setTodoStatus] = useState<TodoStatus>('Nästa')
  const [todoImportant, setTodoImportant] = useState(false)

  const [agendaTime, setAgendaTime] = useState('')
  const [agendaTitle, setAgendaTitle] = useState('')
  const [agendaDetail, setAgendaDetail] = useState('')
  const [agendaImportant, setAgendaImportant] = useState(false)

  const [meetingTime, setMeetingTime] = useState('')
  const [meetingName, setMeetingName] = useState('')
  const [meetingAttendees, setMeetingAttendees] = useState('')
  const [meetingImportant, setMeetingImportant] = useState(false)

  const [noteInput, setNoteInput] = useState('')

  const [editingAgendaId, setEditingAgendaId] = useState<number | null>(null)
  const [editingMeetingId, setEditingMeetingId] = useState<number | null>(null)
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null)

  useEffect(() => {
    window.localStorage.setItem(storageKeys.agenda, JSON.stringify(agenda))
  }, [agenda])

  useEffect(() => {
    window.localStorage.setItem(storageKeys.todos, JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    window.localStorage.setItem(storageKeys.meetings, JSON.stringify(meetings))
  }, [meetings])

  useEffect(() => {
    window.localStorage.setItem(storageKeys.notes, JSON.stringify(notes))
  }, [notes])

  const sortedAgenda = useMemo(() => [...agenda].sort((a, b) => a.time.localeCompare(b.time)), [agenda])
  const sortedMeetings = useMemo(() => [...meetings].sort((a, b) => a.time.localeCompare(b.time)), [meetings])
  const completedTodos = useMemo(() => todos.filter((todo) => todo.status === 'Klar').length, [todos])
  const activeTodos = useMemo(() => todos.filter((todo) => todo.status !== 'Klar').length, [todos])
  const highPriorityMails = useMemo(() => mails.filter((mail) => mail.priority === 'Hög').length, [mails])
  const importantMeetings = useMemo(() => meetings.filter((meeting) => meeting.important).length, [meetings])
  const progressPercent = todos.length > 0 ? Math.round((completedTodos / todos.length) * 100) : 0
  const focusMessage = activeTodos <= 2 ? 'Lugn rytm idag' : progressPercent >= 50 ? 'Bra tempo idag' : 'Börja med första viktiga uppgiften'

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

  const handleAddNote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!noteInput.trim()) return
    setNotes((current) => [{ id: Date.now(), text: noteInput.trim() }, ...current])
    setNoteInput('')
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

  const removeAgenda = (id: number) => setAgenda((current) => current.filter((item) => item.id !== id))
  const removeMeeting = (id: number) => setMeetings((current) => current.filter((meeting) => meeting.id !== id))
  const removeNote = (id: number) => setNotes((current) => current.filter((note) => note.id !== id))

  const updateAgendaItem = (id: number, field: keyof Omit<AgendaItem, 'id'>, value: string | boolean) => setAgenda((current) => current.map((item) => (item.id === id ? { ...item, [field]: value } : item)).sort((a, b) => a.time.localeCompare(b.time)))
  const updateMeetingItem = (id: number, field: keyof Omit<MeetingItem, 'id'>, value: string | boolean) => setMeetings((current) => current.map((item) => (item.id === id ? { ...item, [field]: value } : item)).sort((a, b) => a.time.localeCompare(b.time)))
  const updateTodoItem = (id: number, value: string) => setTodos((current) => current.map((item) => (item.id === id ? { ...item, title: value } : item)))

  return (
    <main className="dashboard-shell">
      <section className="topbar card">
        <div className="topbar-copy">
          <p className="eyebrow">Mission control</p>
          <h1>Lugn överblick, tydligt fokus</h1>
          <p className="lede">Det viktigaste först. Din to do är huvudytan, planeringen ligger i mitten och kalendern finns nära som stöd.</p>
        </div>

        <div className="stats-grid compact-stats">
          <article className="stat-card accent-peach">
            <span>Uppgifter kvar</span>
            <strong>{activeTodos}</strong>
            <p>{completedTodos} klara</p>
          </article>
          <article className="stat-card accent-sand">
            <span>Viktiga mail</span>
            <strong>{highPriorityMails}</strong>
            <p>Snabba att scanna</p>
          </article>
          <article className="stat-card accent-lilac">
            <span>Viktiga möten</span>
            <strong>{importantMeetings}</strong>
            <p>{meetings.length} totalt idag</p>
          </article>
        </div>
      </section>

      <section className="structured-layout">
        <article className="card todo-spotlight">
          <div className="section-head">
            <div>
              <p className="eyebrow">Huvudfokus</p>
              <h2>To do</h2>
            </div>
            <span className="percentage-pill">{progressPercent}%</span>
          </div>

          <div className="focus-summary">
            <strong>{focusMessage}</strong>
            <p>{completedTodos} av {todos.length} uppgifter är klara idag</p>
          </div>

          <div className="progress-bar"><div className="progress-value" style={{ width: `${progressPercent}%` }} /></div>

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

          <div className="todo-list large-list">
            {todos.map((item) => (
              <div key={item.id} className={`mini-card todo-card ${item.important ? 'important-row' : ''}`}>
                <button className="check-toggle" type="button" aria-label="Byt status" onClick={() => toggleTodoStatus(item.id)} />
                <div className="grow">
                  {editingTodoId === item.id ? (
                    <input className="edit-input" value={item.title} onChange={(event) => updateTodoItem(item.id, event.target.value)} />
                  ) : (
                    <>
                      <div className="mini-top">
                        <div>
                          <h3>{item.title}</h3>
                          <p>{item.important ? 'Huvudfokus' : 'Vanlig uppgift'}</p>
                        </div>
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

        <article className="card center-structure">
          <div className="section-head">
            <div>
              <p className="eyebrow">Struktur</p>
              <h2>Agenda + möten</h2>
            </div>
          </div>

          <div className="timeline-list structured-timeline">
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

          <div className="split-mini-grid">
            <article className="inner-card">
              <div className="split-header">
                <div>
                  <p className="eyebrow">Agenda</p>
                  <h3>Lägg till</h3>
                </div>
              </div>

              <form className="compact-form" onSubmit={handleAddAgenda}>
                <input value={agendaTime} onChange={(event) => setAgendaTime(event.target.value)} placeholder="Tid" />
                <input value={agendaTitle} onChange={(event) => setAgendaTitle(event.target.value)} placeholder="Vad ska göras?" />
                <input value={agendaDetail} onChange={(event) => setAgendaDetail(event.target.value)} placeholder="Kort beskrivning" />
                <label className="checkbox-row"><input type="checkbox" checked={agendaImportant} onChange={(event) => setAgendaImportant(event.target.checked)} /> Viktig</label>
                <button type="submit">Lägg till</button>
              </form>

              <div className="mini-list short-list">
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

            <article className="inner-card">
              <div className="split-header">
                <div>
                  <p className="eyebrow">Möten</p>
                  <h3>Lägg till</h3>
                </div>
              </div>

              <form className="compact-form" onSubmit={handleAddMeeting}>
                <input value={meetingTime} onChange={(event) => setMeetingTime(event.target.value)} placeholder="Tid" />
                <input value={meetingName} onChange={(event) => setMeetingName(event.target.value)} placeholder="Mötesnamn" />
                <input value={meetingAttendees} onChange={(event) => setMeetingAttendees(event.target.value)} placeholder="Deltagare" />
                <label className="checkbox-row"><input type="checkbox" checked={meetingImportant} onChange={(event) => setMeetingImportant(event.target.checked)} /> Viktig</label>
                <button type="submit">Lägg till</button>
              </form>

              <div className="mini-list short-list">
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
          </div>
        </article>

        <aside className="right-support">
          <article className="card calendar-panel support-card">
            <div className="section-head">
              <div>
                <p className="eyebrow">Stöd</p>
                <h2>Kalender</h2>
              </div>
            </div>

            <div className="calendar-wrap">
              <iframe src={googleCalendarEmbedUrl} title="Google Kalender" className="calendar-embed" frameBorder="0" scrolling="no" />
            </div>
          </article>

          <article className="card notes-panel support-card">
            <div className="section-head">
              <div>
                <p className="eyebrow">Quick notes</p>
                <h2>Snabba anteckningar</h2>
              </div>
            </div>

            <form className="compact-form" onSubmit={handleAddNote}>
              <input value={noteInput} onChange={(event) => setNoteInput(event.target.value)} placeholder="Skriv en snabb notis" />
              <button type="submit">Spara notis</button>
            </form>

            <div className="mini-list short-list">
              {notes.map((note) => (
                <div key={note.id} className="mini-card no-check note-card">
                  <div className="grow">
                    <p>{note.text}</p>
                    <div className="mini-actions">
                      <button className="text-button danger" type="button" onClick={() => removeNote(note.id)}>Ta bort</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>
    </main>
  )
}

export default App
