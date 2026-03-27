import { google } from 'googleapis'

export default async function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(500).json({ error: 'Google env-variabler saknas' })
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
  const code = req.query.code

  if (!code) {
    return res.status(400).json({ error: 'Ingen code från Google callback' })
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)

    return res.status(200).json({
      ok: true,
      message: 'Google Kalender kopplad',
      hasAccessToken: Boolean(tokens.access_token),
      hasRefreshToken: Boolean(tokens.refresh_token),
      nextStep: 'Nästa steg är att spara tokens säkert och koppla /api/meetings till Google Kalender.',
    })
  } catch {
    return res.status(500).json({ error: 'Kunde inte växla code mot tokens' })
  }
}
