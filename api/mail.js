import { google } from 'googleapis'

export default async function handler(req, res) {
  // CORS headers för att tillåta anrop från vilken domän som helst
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Hantera CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const { action, id } = req.query

    // Hämta OAuth tokens från environment variables
    const accessToken = process.env.GOOGLE_ACCESS_TOKEN
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

    if (!accessToken) {
      console.error('Google OAuth tokens saknas')
      return res.status(500).json({
        success: false,
        error: 'Google OAuth är inte konfigurerat. Vänligen kontakta administratören.'
      })
    }

    // Skapa OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    // Sätt credentials
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    })

    // Skapa Gmail API client
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    // Hämta lista över olästa mail
    if (action === 'unread') {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread',
        maxResults: 10
      })

      const messages = response.data.messages || []

      // Hämta detaljer för varje mail
      const detailedMails = await Promise.all(
        messages.map(async (msg) => {
          try {
            const detail = await gmail.users.messages.get({
              userId: 'me',
              id: msg.id,
              format: 'metadata'
            })

            const headers = detail.data.payload?.headers || []

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
              id: detail.data.id,
              threadId: detail.data.threadId,
              from,
              subject,
              date: formattedDate,
              timestamp: dateObj.getTime(),
              snippet: detail.data.snippet || '',
              isUnread: detail.data.labelIds?.includes('UNREAD') || false
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
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: id,
        format: 'full'
      })

      const headers = detail.data.payload?.headers || []

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

      body = findBody(detail.data.payload) || detail.data.snippet || ''

      return res.json({
        success: true,
        mail: {
          id: detail.data.id,
          threadId: detail.data.threadId,
          from,
          to,
          subject,
          date,
          body,
          isUnread: detail.data.labelIds?.includes('UNREAD') || false
        }
      })
    }

    return res.status(400).json({ success: false, error: 'Okänd action' })
  } catch (error) {
    console.error('Mail API error:', error.message)
    
    // Om felet är relaterat till auth, ge ett tydligare meddelande
    if (error.message.includes('invalid_grant') || error.message.includes('unauthorized_client')) {
      return res.status(401).json({
        success: false,
        error: 'OAuth-token har löpt ut. Vänligen autentisera om.'
      })
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Något gick fel'
    })
  }
}
