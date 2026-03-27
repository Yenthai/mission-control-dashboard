const weatherCodeMap = {
  0: { label: 'Klart', icon: '☀️' },
  1: { label: 'Mest klart', icon: '🌤️' },
  2: { label: 'Delvis molnigt', icon: '⛅' },
  3: { label: 'Molnigt', icon: '☁️' },
  45: { label: 'Dimma', icon: '🌫️' },
  48: { label: 'Dimma', icon: '🌫️' },
  51: { label: 'Lätt duggregn', icon: '🌦️' },
  53: { label: 'Duggregn', icon: '🌦️' },
  55: { label: 'Tätt duggregn', icon: '🌧️' },
  61: { label: 'Lätt regn', icon: '🌦️' },
  63: { label: 'Regn', icon: '🌧️' },
  65: { label: 'Kraftigt regn', icon: '🌧️' },
  71: { label: 'Lätt snö', icon: '🌨️' },
  73: { label: 'Snö', icon: '❄️' },
  75: { label: 'Kraftig snö', icon: '❄️' },
  80: { label: 'Regnskurar', icon: '🌦️' },
  81: { label: 'Regnskurar', icon: '🌧️' },
  82: { label: 'Kraftiga skurar', icon: '⛈️' },
  95: { label: 'Åska', icon: '⛈️' },
  96: { label: 'Åska med hagel', icon: '⛈️' },
  99: { label: 'Åska med hagel', icon: '⛈️' },
}

function mapWeatherCode(code) {
  if (code === undefined) return { label: 'Okänt väder', icon: '☁️' }
  return weatherCodeMap[code] || { label: 'Okänt väder', icon: '☁️' }
}

export default async function handler(req, res) {
  const latitude = req.query.latitude
  const longitude = req.query.longitude

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'latitude och longitude krävs' })
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
    const response = await fetch(url)

    if (!response.ok) {
      return res.status(502).json({ error: 'Kunde inte hämta väder från Open-Meteo' })
    }

    const data = await response.json()
    const current = data.current || {}
    const mapped = mapWeatherCode(current.weather_code)

    return res.status(200).json({
      temperature: Math.round(current.temperature_2m ?? 0),
      label: mapped.label,
      icon: mapped.icon,
    })
  } catch {
    return res.status(500).json({ error: 'Internt väderfel' })
  }
}
