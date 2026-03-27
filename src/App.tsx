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
  important: boolean
}

type TodoStatus = 'PRIO' | 'Pågår' | 'Klar'
type TodoFilter = 'Alla' | 'Aktiva' | 'Klara'

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

const storageKeys = {
  agenda: 'mission-control-agenda',
  todos: 'mission-control-todos',
  mails: 'mission-control-mails',
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

  const [todoInput, setTodoInput] = useState('')
  const [todoStatus, setTodoStatus] = useState<TodoStatus>('PRIO')
  const [todoImportant, setTodoImportant] = useState(false)
  const [todoFilter, setTodoFilter] = useState<TodoFilter>('Alla')

  const [agendaTime, setAgendaTime] = useState('')
  const [agendaTitle, setAgendaTitle] = useState('')
  const [agendaDetail, setAgendaDetail] = useState('')
  const [agendaImportant, setAgendaImportant] = useState(false)

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
  const progressPercent = todos.length > 0 ? Math.round((completedTodos / todos.length) * 100) : 0
  const focusMessage = activeTodos <= 2 ? 'Lugn rytm idag' : progressPercent >= 50 ? 'Bra tempo idag' : 'Börja med första viktiga uppgiften'

  const handleAddTodo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!todoInput.trim()) return
    setTodos((current) => [{ id: Date.now(), title: todoInput.trim(), status: todoStatus, important: todoImportant }, ...current])
    setTodoInput('')
    setTodoStatus('PRIO')
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

  const toggleAgendaImportant = (id: number) => setAgenda((current) => current.map((item) => (item.id === id ? { ...item, important: !item.important } : item)))
  const removeAgenda = (id: number) => setAgenda((current) => current.filter((item) => item.id !== id))
  const removeNote = (id: number) => setNotes((current) => current.filter((note) => note.id !== id))

  const updateAgendaItem = (id: number, field: keyof Omit<AgendaItem, 'id'>, value: string | boolean) => setAgenda((current) => current.map((item) => (item.id === id ? { ...item, [field]: value } : item)).sort((a, b) => a.time.localeCompare(b.time)))
  const updateTodoItem = (id: number, value: string) => setTodos((current) => current.map((item) => (item.id === id ? { ...item, title: value } : item)))

  return (
    <main className="dashboard-shell">
      <section className="topbar card">
        <div className="topbar-copy">
          <p className="eyebrow">Mission control</p>
          <h1>Välkommen tillbaka Yen</h1>
        </div>

        <LiveWidget />
      </section>

      <section className="structured-layout">
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

        <article className="card center-structure">
          <div className="section-head">
            <div>
              <p className="eyebrow">Struktur</p>
              <h2>Översikt</h2>
            </div>
          </div>

          <div className="split-mini-grid">
            <AgendaPanel
              agendaTime={agendaTime}
              setAgendaTime={setAgendaTime}
              agendaTitle={agendaTitle}
              setAgendaTitle={setAgendaTitle}
              agendaDetail={agendaDetail}
              setAgendaDetail={setAgendaDetail}
              agendaImportant={agendaImportant}
              setAgendaImportant={setAgendaImportant}
              handleAddAgenda={handleAddAgenda}
              sortedAgenda={sortedAgenda}
              editingAgendaId={editingAgendaId}
              setEditingAgendaId={setEditingAgendaId}
              updateAgendaItem={updateAgendaItem}
              removeAgenda={removeAgenda}
              toggleAgendaImportant={toggleAgendaImportant}
            />

            <MeetingsPanel />
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

          <NotesPanel
notes={notes}
noteInput={noteInput}
setNoteInput={setNoteInput}
handleAddNote={handleAddNote}
removeNote={removeNote}
/>
     
        </aside>
      </section>
    </main>
  )
}

export default App
