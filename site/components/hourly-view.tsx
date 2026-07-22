'use client'

import { Clock, Droplet } from 'lucide-react'
import { WeatherIcon } from '@/components/weather-icon'
import {
  getWeatherInfo,
  tempSymbol,
  windLabel,
  formatHour,
  type WeatherResponse,
  type Settings,
} from '@/lib/weather'

export function HourlyView({
  data,
  settings,
}: {
  data: WeatherResponse
  settings: Settings
}) {
  const { hourly } = data
  const ts = tempSymbol(settings.tempUnit)
  const wl = windLabel(settings.windUnit)

  const now = Date.now()
  let startIdx = 0
  for (let i = 0; i < hourly.time.length; i++) {
    if (new Date(hourly.time[i]).getTime() >= now - 3600000) {
      startIdx = i
      break
    }
  }
  const rows = hourly.time.slice(startIdx, startIdx + 24).map((t, i) => {
    const idx = startIdx + i
    return {
      time: formatHour(t),
      temp: Math.round(hourly.temperature_2m[idx]),
      code: hourly.weather_code[idx],
      precip: hourly.precipitation_probability[idx] ?? 0,
      wind: Math.round(hourly.wind_speed_10m[idx] ?? 0),
      hum: hourly.relative_humidity_2m[idx] ?? 0,
    }
  })

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Clock className="size-4" />
        <h2>Detailed Hourly</h2>
      </div>

      <div className="grid grid-cols-[64px_60px_1fr_64px_64px] gap-2 border-b border-border pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid-cols-[80px_72px_1fr_80px_80px]">
        <span>Time</span>
        <span>Temp</span>
        <span>Condition</span>
        <span className="text-right">Precip</span>
        <span className="text-right">Wind</span>
      </div>

      <div className="flex flex-col">
        {rows.map((r, i) => {
          const info = getWeatherInfo(r.code)
          return (
            <div
              key={i}
              className="grid grid-cols-[64px_60px_1fr_64px_64px] items-center gap-2 border-b border-border/50 py-3 text-sm last:border-0 sm:grid-cols-[80px_72px_1fr_80px_80px]"
            >
              <span className="font-medium text-muted-foreground">{r.time}</span>
              <span className="font-semibold tabular-nums">
                {r.temp}
                {ts}
              </span>
              <span className="flex items-center gap-2 truncate">
                <WeatherIcon icon={info.icon} className="size-5 shrink-0 text-primary" />
                <span className="truncate">{info.text}</span>
              </span>
              <span className="flex items-center justify-end gap-1 text-accent tabular-nums">
                <Droplet className="size-3.5" />
                {r.precip}%
              </span>
              <span className="text-right text-muted-foreground tabular-nums">
                {r.wind} {wl}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
