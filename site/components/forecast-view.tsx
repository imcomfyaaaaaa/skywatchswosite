'use client'

import { CalendarDays, Droplet, Sun } from 'lucide-react'
import { WeatherIcon } from '@/components/weather-icon'
import {
  getWeatherInfo,
  formatDay,
  type WeatherResponse,
} from '@/lib/weather'

export function ForecastView({ data }: { data: WeatherResponse }) {
  const { daily } = data

  return (
    <section className="border-b border-border py-6">
      <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <CalendarDays className="size-4" />
        <h2 className="font-semibold">Detailed 7-Day Forecast</h2>
      </div>

      <div className="grid grid-cols-[1fr_84px_56px_48px] gap-2 border-b border-border pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid-cols-[1.4fr_1fr_96px_72px_56px]">
        <span>Day</span>
        <span className="hidden sm:block">Condition</span>
        <span className="text-right sm:text-left">High / Low</span>
        <span className="text-right">Precip</span>
        <span className="text-right">UV</span>
      </div>

      <div className="flex flex-col">
        {daily.time.slice(0, 7).map((day, i) => {
          const info = getWeatherInfo(daily.weather_code[i])
          const max = Math.round(daily.temperature_2m_max[i])
          const min = Math.round(daily.temperature_2m_min[i])
          return (
            <div
              key={day}
              className="grid grid-cols-[1fr_84px_56px_48px] items-center gap-2 border-b border-border/50 py-3.5 text-sm last:border-0 sm:grid-cols-[1.4fr_1fr_96px_72px_56px]"
            >
              <span className="flex items-center gap-2 font-medium">
                <WeatherIcon icon={info.icon} className="size-6 shrink-0 text-primary" />
                {i === 0 ? 'Today' : formatDay(day)}
              </span>
              <span className="hidden truncate text-muted-foreground sm:block">{info.text}</span>
              <span className="text-right tabular-nums tracking-tight sm:text-left">
                <span className="text-lg font-light">{max}°</span>{' '}
                <span className="text-sm font-light text-muted-foreground">{min}°</span>
              </span>
              <span className="flex items-center justify-end gap-1 text-accent tabular-nums">
                <Droplet className="size-3.5" />
                {(daily.precipitation_sum?.[i] ?? 0).toFixed(1)}
              </span>
              <span className="flex items-center justify-end gap-1 text-muted-foreground tabular-nums">
                <Sun className="size-3.5" />
                {daily.uv_index_max?.[i]?.toFixed(1) ?? '--'}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
