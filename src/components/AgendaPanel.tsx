import { useState } from 'react'

type AgendaItem = {
  id: number
  time: string
  title: string
  detail: string
  important: boolean
}

type AgendaPanelProps = {
  agendaTime: string
  setAgendaTime: (value: string) => void
  agendaTitle: string
  setAgendaTitle: (value: string) => void
  agendaDetail: string
  setAgendaDetail: (value: string) => void
  agendaImportant: boolean
  setAgendaImportant: (value: boolean) => void
  handleAddAgenda: (event: React.FormEvent<HTMLFormElement>) => void
  sortedAgenda: AgendaItem[]
  editingAgendaId: number | null
  setEditingAgendaId: (id: number | null) => void
  updateAgendaItem: (id: number, field: keyof Omit<AgendaItem, 'id'>, value: string | boolean) => void
  removeAgenda: (id: number) => void
  toggleAgendaImportant: (id: number) => void
}

export default function AgendaPanel({
  agendaTime,
  setAgendaTime,
  agendaTitle,
  setAgendaTitle,
  agendaDetail,
  setAgendaDetail,
  agendaImportant,
  setAgendaImportant,
  handleAddAgenda,
  sortedAgenda,
  editingAgendaId,
  setEditingAgendaId,
  updateAgendaItem,
  removeAgenda,
  toggleAgendaImportant,
}: AgendaPanelProps) {
  const [showComposer, setShowComposer] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    handleAddAgenda(event)
    setShowComposer(false)
  }

  return (
    <article className="inner-card">
      <div className="split-header">
        <div>
          <p className="eyebrow">Agenda</p>
          <h3>Dagens agenda</h3>
        </div>
        <button
          type="button"
          className={`icon-button ${showComposer ? 'is-open' : ''}`}
          aria-label={showComposer ? 'Stäng agendapanel' : 'Öppna agendapanel'}
          onClick={() => setShowComposer((current) => !current)}
        >
          {showComposer ? '-' : '+'}
        </button>
      </div>

      {showComposer && (
        <div className="slide-panel">
          <div className="slide-panel-head">
            <div>
              <p className="eyebrow">Ny agendapunkt</p>
              <h3>Lägg till</h3>
            </div>
            <button type="button" className="text-button" onClick={() => setShowComposer(false)}>Stäng</button>
          </div>

          <form className="compact-form" onSubmit={handleSubmit}>
            <input value={agendaTime} onChange={(event) => setAgendaTime(event.target.value)} placeholder="Tid" />
            <input value={agendaTitle} onChange={(event) => setAgendaTitle(event.target.value)} placeholder="Vad ska göras?" />
            <input value={agendaDetail} onChange={(event) => setAgendaDetail(event.target.value)} placeholder="Kort beskrivning" />
            <label className="checkbox-row"><input type="checkbox" checked={agendaImportant} onChange={(event) => setAgendaImportant(event.target.checked)} /> Viktig</label>
            <button type="submit">Lägg till</button>
          </form>
        </div>
      )}

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
  )
}
