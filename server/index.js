import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
res.json({
ok: true,
message: 'Backend fungerar',
})
})

app.get('/api/meetings', (_req, res) => {
res.json([
{ id: '1', time: '09:00', title: 'Morgonplanering', link: 'https://meet.google.com/' },
{ id: '2', time: '11:30', title: 'Avstämning med Filip', link: 'https://meet.google.com/' },
{ id: '3', time: '15:00', title: 'Kundmöte', link: 'https://meet.google.com/' },
])
})

app.listen(PORT, () => {
console.log(`Backend kör på http://localhost:${PORT}`)
})
