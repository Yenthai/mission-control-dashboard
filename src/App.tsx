import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import NotesPanel from './components/NotesPanel'
import MeetingsPanel from './components/MeetingsPanel'
import TodoPanel from './components/TodoPanel'
import AgendaPanel from './components/AgendaPanel'
import LiveWidget from './components/LiveWidget'

type AgendaItem = {
  id: number
  time: string
  title: string
  detail: string
}

type TodoStatus = 'PRIO' | 'Pågår' | 'Klar'
type TodoFilter = 'Alla' | 'Aktiva' | 'Klara'
type ViewKey = 'overview' | 'notes' | 'meetings' | 'todo' | 'focus' | 'settings'

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

type NoteItem = {
  id: number
  text: string
}

type NavItem = {
  key: ViewKey
  label: string
  icon: string
  eyebrow: string
}

const storageKeys = {
  agenda: 'mission-control-agenda',
  todos: 'mission-control-todos',
  mails: 'mission-control-mails',
  notes: 'mission-control-notes',
}

const googleCalendarEmbedUrl =
  'https://calendar.google.com/calendar/embed?src=yen.thairakic%40gmail.com&ctz=UTC'

const navItems: NavItem[] = [
  { key: 'overview', label: 'Översikt', icon: '◌', eyebrow: 'Hem' },
  { key: 'notes', label: 'Notes', icon: '✦', eyebrow: 'Skrivyta' },
  { key: 'meetings', label: 'Meetings', icon: '◈', eyebrow: 'Kalender' },
  { key: 'todo', label: 'Todo', icon: '✓', eyebrow: 'Fokus' },
  { key: 'focus', label: 'Fokus idag', icon: '☽', eyebrow: 'Prioritet' },
  { key: 'settings', label: 'Inställningar', icon: '⋯', eyebrow: 'System' },
]

const defaultAgenda: AgendaItem[] = [
  { id: 1, time: '09:00', title: 'Planera dagen', detail: 'Gå igenom mål, dagens viktigaste uppgifter och tidblock.' },
  { id: 2, time: '10:30', title: 'Kunduppföljning', detail: 'Svar på leads och prioritera nästa steg.' },
  { id: 3, time: '13:00', title: 'Admin + mail', detail: 'Rensa inkorg och svara på viktiga trådar.' },
  { id: 4, time: '15:00', title: 'Projektfokus', detail: 'Arbeta ostört med pågående dashboard och struktur.' },
]

const defaultTodos: TodoItem[] = [
  { id: 1, title: 'Skicka uppföljning till nya leads', status: 'Pågår', important: true },
  { id: 2, title: 'Förbered morgondagens mötespunkter', status: 'PRIO', important: true },
  { id: 3, title: 'Rensa inkorg och markera viktiga svar', status: 'PRIO', important: false },
  { id: 4, title: 'Kontrollera veckans deadlines', status: 'Klar', important: false },
]

const defaultMails: MailItem[] = [
  { id: 1, sender: 'Filip', subject: 'Snabb avstämning om Telestore', priority: 'Hög' },
  { id: 2, sender: 'Kundkontakt', subject: 'Återkoppling på offert', priority: 'Hög' },
  { id: 3, sender: 'Samarbetspartner', subject: 'Uppdatering om nästa steg', priority: 'Medel' },
]

const defaultNotes: NoteItem[] = [
  { id: 1, text: 'Kom ihåg att följa upp högprio-leads före lunch.' },
  { id: 2, text: 'Dubbelkolla mötespunkter inför Filip-avstämningen.' },
]

const viewMeta: Record<ViewKey, { title: string; eyebrow: string; description: string }> = {
  overview: {
    title: 'Översikt',
    eyebrow: 'Mission control',
    description: 'En varm premiumvy för dagens viktigaste fokus, nästa steg och en lugn kontroll över allt som pågår.',
  },
  notes: {
    title: 'Notes',
    eyebrow: 'Skrivyta',
    description: 'Samla snabba tankar, uppföljningar och sådant du inte vill tappa bort.',
  },
  meetings: {
    title: 'Meetings',
    eyebrow: 'Kalender',
    description: 'Se dagens möten och håll koll på vad som kommer härnäst.',
  },
  todo: {
    title: 'Todo',
    eyebrow: 'Huvudfokus',
    description: 'Prioritera rätt och flytta arbetet framåt utan att tappa överblicken.',
  },
  focus: {
    title: 'Fokus idag',
    eyebrow: 'Prioritet',
    description: 'Det viktigaste just nu, samlat i en lugnare och mer belönande vy.',
  },
  settings: {
    title: 'Inställningar',
    eyebrow: 'System',
    description: 'Plats för kommande val, preferenser och justeringar i dashboarden.',
  },
}

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
  useState<MailItem[]>(() => readStorage(storageKeys.mails, defaultMails))
  const [notes, setNotes] = useState<NoteItem[]>(() => readStorage(storageKeys.notes, defaultNotes))
  const [activeView, setActiveView] = useState<ViewKey>('overview')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const [todoInput, setTodoInput] = useState('')
  const [todoStatus, setTodoStatus] = useState<TodoStatus>('PRIO')
  const [todoFilter, setTodoFilter] = useState<TodoFilter>('Alla')

  const [agendaTime, setAgendaTime] = useState('')
  const [agendaTitle, setAgendaTitle] = useState('')
  const [agendaDetail, setAgendaDetail] = useState('')

  const [noteInput, setNoteInput] = useState('')

  const [editingAgendaId, setEditingAgendaId] = useState<number | null>(null)
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null)

  useEffect(() => {
    window.localStorage.setItem(storageKeys.agenda, JSON.stringify(agenda))
  }, [agenda])

  useEffect(() => {
    window.localStorage.setItem(storageKeys.todos, JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    window.localStorage.setItem(storageKeys.notes, JSON.stringify(notes))
  }, [notes])

  useEffect(() => {
    if (!mobileSidebarOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileSidebarOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileSidebarOpen])

  const sortedAgenda = useMemo(() => [...agenda].sort((a, b) => a.time.localeCompare(b.time)), [agenda])
  const sortedTodos = useMemo(() => {
    const active = todos.filter((todo) => todo.status !== 'Klar')
    const completed = todos.filter((todo) => todo.status === 'Klar')
    return [...active, ...completed]
  }, [todos])

  const visibleTodos = useMemo(() => {
    if (todoFilter === 'Aktiva') return sortedTodos.filter((todo) => todo.status !== 'Klar')
    if (todoFilter === 'Klara') return sortedTodos.filter((todo) => todo.status === 'Klar')
    return sortedTodos
  }, [sortedTodos, todoFilter])

  const completedTodos = useMemo(() => todos.filter((todo) => todo.status === 'Klar').length, [todos])
  const activeTodos = useMemo(() => todos.filter((todo) => todo.status !== 'Klar').length, [todos])
  const importantTodos = useMemo(() => todos.filter((todo) => todo.important && todo.status !== 'Klar').length, [todos])
  const progressPercent = todos.length > 0 ? Math.round((completedTodos / todos.length) * 100) : 0
  const focusMessage = activeTodos <= 2 ? 'Lugn rytm idag' : progressPercent >= 50 ? 'Bra tempo idag' : 'Börja med första viktiga uppgiften'
  const latestNote = notes[0]?.text ?? 'Ingen notis ännu — skriv första tanken här.'
  const nextAgenda = sortedAgenda[0]
  const pageMeta = viewMeta[activeView]

  const handleAddTodo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!todoInput.trim()) return
    setTodos((current) => [{ id: Date.now(), title: todoInput.trim(), status: todoStatus, important: false }, ...current])
    setTodoInput('')
    setTodoStatus('PRIO')
  }

  const handleAddAgenda = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!agendaTime.trim() || !agendaTitle.trim()) return
    setAgenda((current) => [{ id: Date.now(), time: agendaTime.trim(), title: agendaTitle.trim(), detail: agendaDetail.trim() || 'Ingen extra beskrivning än.' }, ...current].sort((a, b) => a.time.localeCompare(b.time)))
    setAgendaTime('')
    setAgendaTitle('')
    setAgendaDetail('')
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
      if (todo.status === 'PRIO') return { ...todo, status: 'Pågår' }
      if (todo.status === 'Pågår') return { ...todo, status: 'Klar' }
      return { ...todo, status: 'PRIO' }
    }))
  }

  const removeAgenda = (id: number) => setAgenda((current) => current.filter((item) => item.id !== id))
  const removeNote = (id: number) => setNotes((current) => current.filter((note) => note.id !== id))

  const updateAgendaItem = (id: number, field: keyof Omit<AgendaItem, 'id'>, value: string | boolean) => setAgenda((current) => current.map((item) => (item.id === id ? { ...item, [field]: value } : item)).sort((a, b) => a.time.localeCompare(b.time)))
  const updateTodoItem = (id: number, value: string) => setTodos((current) => current.map((item) => (item.id === id ? { ...item, title: value } : item)))

  const handleSelectView = (view: ViewKey) => {
    setActiveView(view)
    setMobileSidebarOpen(false)
  }

  const renderOverview = () => (
    <>
      <section className="hero-card hero-lux card">
        <div className="hero-copy">
          <div className="hero-badge-row">
            <span className="hero-badge">God kväll, Yen</span>
            <span className="hero-badge soft">{focusMessage}</span>
          </div>

          <h1>En varm och tydlig kontrollpanel för allt som behöver din uppmärksamhet.</h1>
          <p className="lede hero-lede">
            Få en lugn överblick över dagens läge, nästa steg och vad som faktiskt är viktigast — utan att sidan känns tung eller rörig.
          </p>

          <div className="hero-actions-row">
            <button type="button" className="header-pill" onClick={() => handleSelectView('todo')}>Öppna fokus</button>
            <button type="button" className="header-pill soft" onClick={() => handleSelectView('notes')}>Skriv note</button>
          </div>

          <div className="hero-mini-summary">
            <div className="hero-summary-card">
              <span>Viktigast nu</span>
              <strong>{importantTodos > 0 ? `${importantTodos} prioriterade tasks` : 'Lugn start'}</strong>
            </div>
            <div className="hero-summary-card soft">
              <span>Nästa punkt</span>
              <strong>{nextAgenda ? `${nextAgenda.time} · ${nextAgenda.title}` : 'Ingen punkt planerad ännu'}</strong>
            </div>
          </div>
        </div>

        <div className="hero-side">
          <div className="hero-side-stack">
            <LiveWidget />
            <article className="hero-focus-card">
              <p className="eyebrow">Fokus idag</p>
              <h2>{progressPercent}% på väg framåt</h2>
              <p>{completedTodos} av {todos.length} tasks klara. {latestNote}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="overview-stats-grid premium-stats-grid">
        <article className="stat-card accent-peach soft-card stat-card-featured">
          <span>Öppna tasks</span>
          <strong>{activeTodos}</strong>
          <p>{importantTodos} markerade som viktiga just nu</p>
        </article>

        <article className="stat-card accent-sand soft-card">
          <span>Nästa punkt</span>
          <strong>{nextAgenda ? nextAgenda.time : '--:--'}</strong>
          <p>{nextAgenda ? nextAgenda.title : 'Ingen agenda ännu'}</p>
        </article>

        <article className="stat-card accent-lilac soft-card">
          <span>Senaste note</span>
          <strong>{notes.length}</strong>
          <p>{latestNote}</p>
        </article>

        <article className="stat-card accent-cream soft-card">
          <span>Fokus idag</span>
          <strong>{progressPercent}%</strong>
          <p>{focusMessage}</p>
        </article>
      </section>

      <section className="overview-grid premium-overview-grid">
        <div className="overview-main-column">
          <TodoPanel
            progressPercent={progressPercent}
            focusMessage={focusMessage}
            completedTodos={completedTodos}
            totalTodos={todos.length}
            todoInput={todoInput}
            setTodoInput={setTodoInput}
            todoStatus={todoStatus}
            setTodoStatus={setTodoStatus}
            todoFilter={todoFilter}
            setTodoFilter={setTodoFilter}
            visibleTodos={visibleTodos}
            handleAddTodo={handleAddTodo}
            toggleTodoStatus={toggleTodoStatus}
            editingTodoId={editingTodoId}
            setEditingTodoId={setEditingTodoId}
            updateTodoItem={updateTodoItem}
          />

          <NotesPanel
            notes={notes}
            noteInput={noteInput}
            setNoteInput={setNoteInput}
            handleAddNote={handleAddNote}
            removeNote={removeNote}
          />
        </div>

        <aside className="overview-side-column">
          <article className="card shell-panel spotlight-card">
            <p className="eyebrow">Belöning</p>
            <h2>Fortsätt i samma rytm</h2>
            <p className="lede">När du börjar i rätt ordning blir resten enklare. Börja med den viktigaste uppgiften och låt dashboarden hålla ihop resten.</p>
          </article>

          <AgendaPanel
            agendaTime={agendaTime}
            setAgendaTime={setAgendaTime}
            agendaTitle={agendaTitle}
            setAgendaTitle={setAgendaTitle}
            agendaDetail={agendaDetail}
            setAgendaDetail={setAgendaDetail}
            handleAddAgenda={handleAddAgenda}
            sortedAgenda={sortedAgenda}
            editingAgendaId={editingAgendaId}
            setEditingAgendaId={setEditingAgendaId}
            updateAgendaItem={updateAgendaItem}
            removeAgenda={removeAgenda}
          />

          <MeetingsPanel />

          <article className="card support-card calendar-panel shell-panel toned-calendar-panel">
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
        </aside>
      </section>
    </>
  )

  const renderNotesView = () => (
    <section className="single-column-layout">
      <NotesPanel
        notes={notes}
        noteInput={noteInput}
        setNoteInput={setNoteInput}
        handleAddNote={handleAddNote}
        removeNote={removeNote}
      />
    </section>
  )

  const renderMeetingsView = () => (
    <section className="dual-column-layout">
      <MeetingsPanel />
      <article className="card support-card calendar-panel shell-panel toned-calendar-panel">
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
    </section>
  )

  const renderTodoView = () => (
    <section className="single-column-layout">
      <TodoPanel
        progressPercent={progressPercent}
        focusMessage={focusMessage}
        completedTodos={completedTodos}
        totalTodos={todos.length}
        todoInput={todoInput}
        setTodoInput={setTodoInput}
        todoStatus={todoStatus}
        setTodoStatus={setTodoStatus}
        todoFilter={todoFilter}
        setTodoFilter={setTodoFilter}
        visibleTodos={visibleTodos}
        handleAddTodo={handleAddTodo}
        toggleTodoStatus={toggleTodoStatus}
        editingTodoId={editingTodoId}
        setEditingTodoId={setEditingTodoId}
        updateTodoItem={updateTodoItem}
      />
    </section>
  )

  const renderFocusView = () => (
    <section className="focus-layout">
      <article className="card focus-hero-card shell-panel">
        <p className="eyebrow">Fokus idag</p>
        <h2>{focusMessage}</h2>
        <p className="lede">Börja med dina viktigaste uppgifter först och låt resten falla på plats efter det.</p>
        <div className="focus-metrics">
          <div>
            <span>Aktiva</span>
            <strong>{activeTodos}</strong>
          </div>
          <div>
            <span>Klara</span>
            <strong>{completedTodos}</strong>
          </div>
          <div>
            <span>Framsteg</span>
            <strong>{progressPercent}%</strong>
          </div>
        </div>
      </article>

      <div className="dual-column-layout">
        <TodoPanel
          progressPercent={progressPercent}
          focusMessage={focusMessage}
          completedTodos={completedTodos}
          totalTodos={todos.length}
          todoInput={todoInput}
          setTodoInput={setTodoInput}
          todoStatus={todoStatus}
          setTodoStatus={setTodoStatus}
          todoFilter={todoFilter}
          setTodoFilter={setTodoFilter}
          visibleTodos={visibleTodos}
          handleAddTodo={handleAddTodo}
          toggleTodoStatus={toggleTodoStatus}
          editingTodoId={editingTodoId}
          setEditingTodoId={setEditingTodoId}
          updateTodoItem={updateTodoItem}
        />

        <AgendaPanel
          agendaTime={agendaTime}
          setAgendaTime={setAgendaTime}
          agendaTitle={agendaTitle}
          setAgendaTitle={setAgendaTitle}
          agendaDetail={agendaDetail}
          setAgendaDetail={setAgendaDetail}
          handleAddAgenda={handleAddAgenda}
          sortedAgenda={sortedAgenda}
          editingAgendaId={editingAgendaId}
          setEditingAgendaId={setEditingAgendaId}
          updateAgendaItem={updateAgendaItem}
          removeAgenda={removeAgenda}
        />
      </div>
    </section>
  )

  const renderSettingsView = () => (
    <section className="single-column-layout">
      <article className="card shell-panel settings-placeholder">
        <p className="eyebrow">Inställningar</p>
        <h2>Här kan vi bygga nästa steg senare</h2>
        <p className="lede">
          Just nu är detta en mjuk platshållare för framtida val, preferenser och personliga justeringar i dashboarden.
        </p>
      </article>
    </section>
  )

  const renderActiveView = () => {
    switch (activeView) {
      case 'notes':
        return renderNotesView()
      case 'meetings':
        return renderMeetingsView()
      case 'todo':
        return renderTodoView()
      case 'focus':
        return renderFocusView()
      case 'settings':
        return renderSettingsView()
      case 'overview':
      default:
        return renderOverview()
    }
  }

  return (
    <main className="app-shell premium-shell">
      <div className={`mobile-backdrop ${mobileSidebarOpen ? 'is-visible' : ''}`} onClick={() => setMobileSidebarOpen(false)} />

      <aside className={`sidebar-shell premium-sidebar ${mobileSidebarOpen ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">Y</div>
          <div>
            <p className="eyebrow">Mission control</p>
            <h2>Yens dashboard</h2>
          </div>
        </div>

        <article className="sidebar-intro-panel">
          <span className="sidebar-intro-label">Premium workflow</span>
          <strong>Lugn struktur med varm känsla</strong>
          <p>Fokus först, resten efteråt.</p>
        </article>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`sidebar-link ${activeView === item.key ? 'active' : ''}`}
              onClick={() => handleSelectView(item.key)}
            >
              <span className="sidebar-icon" aria-hidden="true">{item.icon}</span>
              <span className="sidebar-copy">
                <small>{item.eyebrow}</small>
                <strong>{item.label}</strong>
              </span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer card premium-sidebar-footer">
          <p className="eyebrow">Status</p>
          <h3>Du har kontroll på läget</h3>
          <p>{activeTodos} aktiva tasks · {notes.length} notes · {sortedAgenda.length} agenda-punkter</p>
        </div>
      </aside>

      <section className="main-shell">
        <header className="page-header card premium-page-header">
          <div className="page-header-copy">
            <button type="button" className="mobile-menu-button" onClick={() => setMobileSidebarOpen(true)}>
              Meny
            </button>
            <p className="eyebrow">{pageMeta.eyebrow}</p>
            <h1>{pageMeta.title}</h1>
            <p className="lede">{pageMeta.description}</p>
          </div>

          <div className="page-header-actions">
            <button type="button" className="header-pill" onClick={() => handleSelectView('notes')}>Ny note</button>
            <button type="button" className="header-pill soft" onClick={() => handleSelectView('todo')}>Till todo</button>
          </div>
        </header>

        <div className="view-shell">{renderActiveView()}</div>
      </section>
    </main>
  )
}

export default App
