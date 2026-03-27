import { useState } from 'react'

type TodoStatus = 'Klar' | 'Pågår' | 'Nästa'
type TodoFilter = 'Alla' | 'Aktiva' | 'Klara'

type TodoItem = {
  id: number
  title: string
  status: TodoStatus
  important: boolean
}

type TodoPanelProps = {
  progressPercent: number
  focusMessage: string
  completedTodos: number
  totalTodos: number
  todoInput: string
  setTodoInput: (value: string) => void
  todoStatus: TodoStatus
  setTodoStatus: (value: TodoStatus) => void
  todoImportant: boolean
  setTodoImportant: (value: boolean) => void
  todoFilter: TodoFilter
  setTodoFilter: (value: TodoFilter) => void
  visibleTodos: TodoItem[]
  handleAddTodo: (event: React.FormEvent<HTMLFormElement>) => void
  toggleTodoStatus: (id: number) => void
  toggleTodoImportant: (id: number) => void
  editingTodoId: number | null
  setEditingTodoId: (id: number | null) => void
  updateTodoItem: (id: number, value: string) => void
}

export default function TodoPanel({
  progressPercent,
  focusMessage,
  completedTodos,
  totalTodos,
  todoInput,
  setTodoInput,
  todoStatus,
  setTodoStatus,
  todoImportant,
  setTodoImportant,
  todoFilter,
  setTodoFilter,
  visibleTodos,
  handleAddTodo,
  toggleTodoStatus,
  toggleTodoImportant,
  editingTodoId,
  setEditingTodoId,
  updateTodoItem,
}: TodoPanelProps) {
  const [showComposer, setShowComposer] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    handleAddTodo(event)
    setShowComposer(false)
  }

  return (
    <article className="card todo-spotlight">
      <div className="section-head todo-header-row">
        <div>
          <p className="eyebrow">Huvudfokus</p>
          <h2>To do</h2>
        </div>
        <div className="todo-header-actions">
          <span className="percentage-pill">{progressPercent}%</span>
          <button
            type="button"
            className={`icon-button ${showComposer ? 'is-open' : ''}`}
            aria-label={showComposer ? 'Stäng uppgiftspanel' : 'Öppna uppgiftspanel'}
            onClick={() => setShowComposer((current) => !current)}
          >
            {showComposer ? '-' : '+'}
          </button>
        </div>
      </div>

      <div className="focus-summary">
        <strong>{focusMessage}</strong>
        <p>{completedTodos} av {totalTodos} uppgifter är klara idag</p>
      </div>

      <div className="todo-filter-row">
        <button type="button" className={`filter-chip ${todoFilter === 'Alla' ? 'active' : ''}`} onClick={() => setTodoFilter('Alla')}>Alla</button>
        <button type="button" className={`filter-chip ${todoFilter === 'Aktiva' ? 'active' : ''}`} onClick={() => setTodoFilter('Aktiva')}>Aktiva</button>
        <button type="button" className={`filter-chip ${todoFilter === 'Klara' ? 'active' : ''}`} onClick={() => setTodoFilter('Klara')}>Klara</button>
      </div>

      <div className="progress-bar"><div className="progress-value" style={{ width: `${progressPercent}%` }} /></div>

      {showComposer && (
        <div className="slide-panel">
          <div className="slide-panel-head">
            <div>
              <p className="eyebrow">Ny uppgift</p>
              <h3>Lägg till</h3>
            </div>
            <button type="button" className="text-button" onClick={() => setShowComposer(false)}>Stäng</button>
          </div>

          <form className="compact-form" onSubmit={handleSubmit}>
            <input value={todoInput} onChange={(event) => setTodoInput(event.target.value)} placeholder="Ny uppgift" />
            <select value={todoStatus} onChange={(event) => setTodoStatus(event.target.value as TodoStatus)}>
              <option>Nästa</option>
              <option>Pågår</option>
              <option>Klar</option>
            </select>
            <label className="checkbox-row"><input type="checkbox" checked={todoImportant} onChange={(event) => setTodoImportant(event.target.checked)} /> Viktig</label>
            <button type="submit">Lägg till</button>
          </form>
        </div>
      )}

      <div className="todo-list large-list">
        {visibleTodos.map((item) => (
          <div key={item.id} className={`mini-card todo-card ${item.important ? 'important-row' : ''} ${item.status === 'Klar' ? 'completed-todo' : ''}`}>
            <button className="check-toggle" type="button" aria-label="Byt status" onClick={() => toggleTodoStatus(item.id)} />
            <div className="grow">
              {editingTodoId === item.id ? (
                <div className="edit-stack grow">
                  <input className="edit-input" value={item.title} onChange={(event) => updateTodoItem(item.id, event.target.value)} />
                  <div className="mini-actions">
                    <button className="text-button" type="button" onClick={() => setEditingTodoId(null)}>Spara</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mini-top">
                    <div>
                      <h3 className={item.status === 'Klar' ? 'completed-text' : ''}>{item.title}</h3>
                      <p className={item.status === 'Klar' ? 'completed-text' : ''}>{item.important ? 'Huvudfokus' : 'Vanlig uppgift'}</p>
                    </div>
                    <span className={`badge status-${item.status.toLowerCase()}`}>{item.status}</span>
                  </div>
                  <div className="mini-actions">
                    <button className="text-button" type="button" onClick={() => toggleTodoImportant(item.id)}>{item.important ? 'Avmarkera' : 'Viktig'}</button>
                    <button className="text-button" type="button" onClick={() => setEditingTodoId(item.id)}>Redigera</button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}
