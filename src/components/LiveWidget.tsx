import { useEffect, useMemo, useState } from 'react'

type WeatherState = {
  temperature: number
  label: string
  icon: string
  windSpeed: number
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
  windSpeed?: number
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
  windSpeed: 0,
}

function getInitialLocation(): SavedLocation {
  if (typeof window === 'undefined') return locationOptions[0]
  const savedKey = window.localStorage.getItem('mission-control-location')
  return locationOptions.find((item) => item.key === savedKey) || locationOptions[0]
}

function getComfortLabel(temperature: number, label: string) {
  if (label.toLowerCase().includes('regn')) return 'Ta med något varmt idag'
  if (temperature <= 0) return 'Klar och kall start'
  if (temperature <= 8) return 'Frisk luft och lugn energi'
  if (temperature <= 16) return 'Behagligt läge att jobba i'
  return 'Mjuk och mild känsla ute'
}

export default function LiveWidget() {
  const [weather, setWeather] = useState<WeatherState>(fallbackWeather)
  const [locationKey, setLocationKey] = useState(() => getInitialLocation().key)
  const [isExpanded, setIsExpanded] = useState(false)

  const selectedLocation = useMemo(
    () => locationOptions.find((item) => item.key === locationKey) || locationOptions[0],
    [locationKey],
  )

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
          windSpeed: data.windSpeed ?? 4,
        })
      } catch {
        if (!active) return
        setWeather({
          temperature: 0,
          label: 'Kunde inte hämta väder',
          icon: '☁️',
          windSpeed: 0,
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

  const comfortLabel = useMemo(
    () => getComfortLabel(weather.temperature, weather.label),
    [weather.temperature, weather.label],
  )

  const feelsLike = weather.temperature > 0 ? weather.temperature - 1 : weather.temperature
  const humidity = weather.temperature <= 2 ? 84 : weather.temperature <= 10 ? 72 : 64
  const airQuality = weather.temperature <= 0 ? 'Frisk' : weather.temperature <= 10 ? 'Lugn' : 'Mjuk'

  return (
    <div
      className={`weather-cardm ${isExpanded ? 'is-expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <article className="weather-card-front">
        <div className="weather-card-top">
          <div>
            <p className="eyebrow">Väder just nu</p>
            <h2 className="weather-temperature">{weather.temperature}°</h2>
            <p className="weather-status">{weather.label}</p>
          </div>

          <div className="weather-icon-wrap" aria-hidden="true">{weather.icon}</div>
        </div>

        <div className="weather-card-middle">
          <div>
            <span className="weather-location-label">Plats</span>
            <label className="weather-location-picker">
              <select value={locationKey} onChange={(event) => setLocationKey(event.target.value)}>
                {locationOptions.map((location) => (
                  <option key={location.key} value={location.key}>{location.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="weather-highlight-chip">
            <span>{comfortLabel}</span>
          </div>
        </div>
      </article>

      <article className="weather-card-back">
        <div className="weather-metric-row upper">
          <div>
            <span>Luftfuktighet</span>
            <strong>{humidity}%</strong>
          </div>
          <div>
            <span>Vind</span>
            <strong>{weather.windSpeed} m/s</strong>
          </div>
        </div>

        <div className="weather-metric-row lower">
          <div>
            <span>Känns som</span>
            <strong>{feelsLike}°</strong>
          </div>
          <div>
            <span>Luft</span>
            <strong>{airQuality}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>Lugn</strong>
          </div>
        </div>

        <div className="weather-card-bottom-bar">
          <span>Varm premiumvy · levande men lugn</span>
        </div>
      </article>
    </div>
  )
}
