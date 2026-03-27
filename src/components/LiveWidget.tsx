import { useEffect, useMemo, useState } from 'react'

type WeatherState = {
  temperature: number
  label: string
  icon: string
}

type SavedLocation = {
  key: string
  label: string
  latitude: number
  longitude: number
}

type WeatherApiResponse = {
  temperature?: number
  label?: string
  icon?: string
}

const locationOptions: SavedLocation[] = [
  { key: 'stockholm', label: 'Stockholm', latitude: 59.3293, longitude: 18.0686 },
  { key: 'karlskoga', label: 'Karlskoga', latitude: 59.3267, longitude: 14.5239 },
  { key: 'orebro', label: 'Örebro', latitude: 59.2753, longitude: 15.2134 },
]

const fallbackWeather: WeatherState = {
  temperature: 0,
  label: 'Väder laddas',
  icon: '☁️',
}

function getInitialLocation(): SavedLocation {
  if (typeof window === 'undefined') return locationOptions[0]
  const savedKey = window.localStorage.getItem('mission-control-location')
  return locationOptions.find((item) => item.key === savedKey) || locationOptions[0]
}

export default function LiveWidget() {
  const [now, setNow] = useState(() => new Date())
  const [weather, setWeather] = useState<WeatherState>(fallbackWeather)
  const [locationKey, setLocationKey] = useState(() => getInitialLocation().key)

  const selectedLocation = useMemo(
    () => locationOptions.find((item) => item.key === locationKey) || locationOptions[0],
    [locationKey],
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    window.localStorage.setItem('mission-control-location', locationKey)
  }, [locationKey])

  useEffect(() => {
    let active = true

    const fetchWeather = async () => {
      try {
        const response = await fetch(`/api/weather?latitude=${selectedLocation.latitude}&longitude=${selectedLocation.longitude}`)
        if (!response.ok) throw new Error('Kunde inte hämta väder')

        const data: WeatherApiResponse = await response.json()

        if (!active) return

        setWeather({
          temperature: data.temperature ?? 0,
          label: data.label ?? 'Okänt väder',
          icon: data.icon ?? '☁️',
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
  }, [selectedLocation])

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

      <div className="live-weather-block">
        <label className="live-location-picker">
          <span>Plats</span>
          <select value={locationKey} onChange={(event) => setLocationKey(event.target.value)}>
            {locationOptions.map((location) => (
              <option key={location.key} value={location.key}>{location.label}</option>
            ))}
          </select>
        </label>

        <div className="live-weather">
          <span className="live-weather-icon" aria-hidden="true">{weather.icon}</span>
          <div>
            <strong>{weather.temperature}°</strong>
            <p>{weather.label}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
