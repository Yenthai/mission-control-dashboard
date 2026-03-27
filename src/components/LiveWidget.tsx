import { useEffect, useMemo, useState } from 'react'

type WeatherState = {
  temperature: number
  label: string
  icon: string
}

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number
    weather_code?: number
  }
}

const stockholmCoords = {
  latitude: 59.3293,
  longitude: 18.0686,
}

const weatherCodeMap: Record<number, { label: string; icon: string }> = {
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

const fallbackWeather: WeatherState = {
  temperature: 0,
  label: 'Väder laddas',
  icon: '☁️',
}

function mapWeatherCode(code?: number): { label: string; icon: string } {
  if (code === undefined) return { label: 'Okänt väder', icon: '☁️' }
  return weatherCodeMap[code] || { label: 'Okänt väder', icon: '☁️' }
}

export default function LiveWidget() {
  const [now, setNow] = useState(() => new Date())
  const [weather, setWeather] = useState<WeatherState>(fallbackWeather)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let active = true

    const fetchWeather = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${stockholmCoords.latitude}&longitude=${stockholmCoords.longitude}&current=temperature_2m,weather_code&timezone=auto`
        const response = await fetch(url)
        if (!response.ok) throw new Error('Kunde inte hämta väder')

        const data: OpenMeteoResponse = await response.json()
        const current = data.current
        const mapped = mapWeatherCode(current?.weather_code)

        if (!active) return

        setWeather({
          temperature: Math.round(current?.temperature_2m ?? 0),
          label: mapped.label,
          icon: mapped.icon,
        })
      } catch {
        if (!active) return
        setWeather({
          temperature: 0,
          label: 'Kunde inte hämta väder',
          icon: '☁️',
        })
      }
    }

    fetchWeather()
    const weatherTimer = window.setInterval(fetchWeather, 15 * 60 * 1000)

    return () => {
      active = false
      window.clearInterval(weatherTimer)
    }
  }, [])

  const currentTime = useMemo(
    () => new Intl.DateTimeFormat('sv-SE', { hour: '2-digit', minute: '2-digit' }).format(now),
    [now],
  )

  const currentDate = useMemo(
    () => new Intl.DateTimeFormat('sv-SE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(now),
    [now],
  )

  return (
    <div className="live-widget">
      <div className="live-main">
        <p className="eyebrow">Live just nu</p>
        <h2 className="live-time">{currentTime}</h2>
        <p className="live-date">{currentDate}</p>
      </div>

      <div className="live-weather">
        <span className="live-weather-icon" aria-hidden="true">{weather.icon}</span>
        <div>
          <strong>{weather.temperature}°</strong>
          <p>{weather.label}</p>
        </div>
      </div>
    </div>
  )
}
