import { useEffect, useMemo, useState } from 'react'

type WeatherState = {
  temperature: number
  label: string
  icon: string
}

const defaultWeather: WeatherState = {
  temperature: 12,
  label: 'Molnigt',
  icon: '☁️',
}

export default function LiveWidget() {
  const [now, setNow] = useState(() => new Date())
  const [weather] = useState<WeatherState>(defaultWeather)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
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
