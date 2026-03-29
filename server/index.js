import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { exec } from 'child_process'
import { promisify } from 'util'

dotenv.config()

const execPromise = promisify(exec)
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

// Gmail API endpoint - hämtar olästa mail via gws CLI
app.get('/api/mail', async (req, res) => {
  try {
    const { action, id } = req.query

    // Hämta lista över olästa mail
    if (action === 'unread') {
      const { stdout, stderr } = await execPromise(
        `cd /home/yenth/.openclaw/workspace && ./node_modules/.bin/gws gmail users messages list --params '{"userId": "me", "q": "is:unread", "maxResults": 10}'`
      )

      if (stderr) {
        console.error('GWS stderr:', stderr)
      }

      const data = JSON.parse(stdout)
      const messages = data.messages || []

      // Hämta detaljer för varje mail
      const detailedMails = await Promise.all(
        messages.map(async (msg) => {
          try {
            const { stdout: detailOut } = await execPromise(
              `cd /home/yenth/.openclaw/workspace && ./node_modules/.bin/gws gmail users messages get --params '{"userId": "me", "id": "${msg.id}", "format": "metadata"}'`
            )

            const detail = JSON.parse(detailOut)
            const headers = detail.payload?.headers || []

            const getHeader = (name) => {
              const header = headers.find(h => h.name === name)
              return header ? header.value : ''
            }

            const date = getHeader('Date')
            const from = getHeader('From')
            const subject = getHeader('Subject')

            // Formatera datumet
            const dateObj = new Date(date)
            const formattedDate = dateObj.toLocaleDateString('sv-SE', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })

            return {
              id: detail.id,
              threadId: detail.threadId,
              from,
              subject,
              date: formattedDate,
              timestamp: dateObj.getTime(),
              snippet: detail.snippet || '',
              isUnread: detail.labelIds?.includes('UNREAD') || false
            }
          } catch (err) {
            console.error(`Fel vid hämtning av mail ${msg.id}:`, err.message)
            return null
          }
        })
      )

      // Filtrera bort null-värden och sortera efter datum (nyast först)
      const validMails = detailedMails
        .filter(m => m !== null)
        .sort((a, b) => b.timestamp - a.timestamp)

      return res.json({ success: true, mails: validMails })
    }

    // Hämta enskilt mail
    if (action === 'get' && id) {
      const { stdout, stderr } = await execPromise(
        `cd /home/yenth/.openclaw/workspace && ./node_modules/.bin/gws gmail users messages get --params '{"userId": "me", "id": "${id}", "format": "full"}'`
      )

      if (stderr) {
        console.error('GWS stderr:', stderr)
      }

      const detail = JSON.parse(stdout)
      const headers = detail.payload?.headers || []

      const getHeader = (name) => {
        const header = headers.find(h => h.name === name)
        return header ? header.value : ''
      }

      const date = getHeader('Date')
      const from = getHeader('From')
      const subject = getHeader('Subject')
      const to = getHeader('To')

      // Hitta body content
      let body = ''
      const findBody = (part) => {
        if (!part) return ''
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf-8')
        }
        if (part.mimeType === 'text/html' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf-8')
        }
        if (part.parts) {
          for (const p of part.parts) {
            const found = findBody(p)
            if (found) return found
          }
        }
        return ''
      }

      body = findBody(detail.payload) || detail.snippet || ''

      return res.json({
        success: true,
        mail: {
          id: detail.id,
          threadId: detail.threadId,
          from,
          to,
          subject,
          date,
          body,
          isUnread: detail.labelIds?.includes('UNREAD') || false
        }
      })
    }

    return res.status(400).json({ success: false, error: 'Okänd action' })
  } catch (error) {
    console.error('Mail API error:', error.message)
    return res.status(500).json({
      success: false,
      error: error.message || 'Något gick fel'
    })
  }
})

app.listen(PORT, () => {
  console.log(`Backend kör på http://localhost:${PORT}`)
  console.log(`Mail API: http://localhost:${PORT}/api/mail?action=unread`)
})
