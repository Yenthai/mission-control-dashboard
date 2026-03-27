type NoteItem = {
id: number
text: string
}

type NotesPanelProps = {
notes: NoteItem[]
noteInput: string
setNoteInput: (value: string) => void
handleAddNote: (event: React.FormEvent<HTMLFormElement>) => void
removeNote: (id: number) => void
}

export default function NotesPanel({

notes,
noteInput,
setNoteInput,
handleAddNote,
removeNote,
}: NotesPanelProps) {
return (
<article className="card notes-panel support-card">
<div className="section-head">
<div>
<p className="eyebrow">Quick notes</p>
<h2>Snabba anteckningar</h2>
</div>
</div>

<form className="compact-form" onSubmit={handleAddNote}>
<input
value={noteInput}
onChange={(event) => setNoteInput(event.target.value)}
placeholder="Skriv en snabb notis"
/>
<button type="submit">Spara notis</button>
</form>

<div className="mini-list short-list">
{notes.map((note) => (
<div key={note.id} className="mini-card no-check note-card">
<div className="grow">
<p>{note.text}</p>
<div className="mini-actions">

<button
className="text-button danger"
type="button"
onClick={() => removeNote(note.id)}
>
Ta bort
</button>
</div>
</div>
</div>
))}
</div>
</article>
)
}
