// Client-side mail fetcher - används när server inte finns tillgänglig (t.ex. Vercel)
// Anropar direkt till gws CLI via browser (kräver att server körs lokalt)

export default async function handler(req, res) {
  // Detta är en fallback för Vercel - returnera instruktion
  return res.json({
    success: false,
    error: 'Mail API kräver lokal server. Kör `node server/index.js` lokalt eller använd Vercel Functions.',
    hint: 'För produktionsanvändning, konfigurera Google OAuth tokens server-side.'
  })
}
