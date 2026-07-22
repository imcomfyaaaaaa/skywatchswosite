'use client'

import { Wind, Droplets, Sun, Thermometer, Clock, CalendarDays, MoonStar, Droplet } from 'lucide-react'
import { WeatherIcon } from '@/components/weather-icon'
import {
  getWeatherInfo,
  getSkyClass,
  tempSymbol,
  windLabel,
  formatHour,
  formatDay,
  type WeatherResponse,
  type Settings,
} from '@/lib/weather'

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        {icon}
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  )
}

function computeTonight(data: WeatherResponse) {
  const now = Date.now()
  const h = data.hourly
  let endEpoch = new Date().setHours(6, 0, 0, 0)
  if (now > endEpoch) endEpoch += 86400000
  let startEpoch = new Date().setHours(20, 0, 0, 0)
  if (now > startEpoch) startEpoch = now
  else if (now < new Date().setHours(6, 0, 0, 0)) startEpoch = now

  let minTemp = Infinity,
    maxPrecip = 0,
    maxWind = 0,
    sumHum = 0,
    count = 0
  const codes: Record<number, number> = {}
  let dominant = 0
  for (let i = 0; i < h.time.length; i++) {
    const t = new Date(h.time[i]).getTime()
    if (t >= startEpoch && t <= endEpoch) {
      if (h.temperature_2m[i] < minTemp) minTemp = h.temperature_2m[i]
      if (h.precipitation_probability[i] > maxPrecip) maxPrecip = h.precipitation_probability[i]
      if (h.wind_speed_10m[i] > maxWind) maxWind = h.wind_speed_10m[i]
      sumHum += h.relative_humidity_2m[i]
      count++
      const c = h.weather_code[i]
      codes[c] = (codes[c] || 0) + 1
      if (codes[c] > (codes[dominant] || 0)) dominant = c
    }
    if (t > endEpoch) break
  }
  if (count === 0) return null
  return {
    code: dominant,
    low: Math.round(minTemp),
    precip: maxPrecip,
    wind: Math.round(maxWind),
    humidity: Math.round(sumHum / count),
  }
}

export function CurrentView({
  data,
  settings,
}: {
  data: WeatherResponse
  settings: Settings
}) {
  const { current, hourly, daily } = data
  const info = getWeatherInfo(current.weather_code)
  const ts = tempSymbol(settings.tempUnit)
  const wl = windLabel(settings.windUnit)

  // hourly next 24
  const now = Date.now()
  let startIdx = 0
  for (let i = 0; i < hourly.time.length; i++) {
    if (new Date(hourly.time[i]).getTime() >= now - 3600000) {
      startIdx = i
      break
    }
  }
  const hours = hourly.time.slice(startIdx, startIdx + 24).map((t, i) => ({
    time: formatHour(t),
    temp: Math.round(hourly.temperature_2m[startIdx + i]),
    code: hourly.weather_code[startIdx + i],
    precip: hourly.precipitation_probability[startIdx + i] ?? 0,
  }))

  const maxes = daily.temperature_2m_max.slice(0, 7).map(Math.round)
  const mins = daily.temperature_2m_min.slice(0, 7).map(Math.round)
  const weekHigh = Math.max(...maxes)
  const weekLow = Math.min(...mins)
  const weekRange = weekHigh - weekLow || 1

  const tonight = computeTonight(data)

  const stats = [
    { icon: Wind, label: 'Wind', value: `${Math.round(current.wind_speed_10m)} ${wl}` },
    { icon: Droplets, label: 'Humidity', value: `${current.relative_humidity_2m}%` },
    { icon: Sun, label: 'UV Index', value: daily.uv_index_max?.[0]?.toFixed(1) ?? '--' },
    { icon: Thermometer, label: 'Feels Like', value: `${Math.round(current.apparent_temperature)}${ts}` },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Hero */}
      <section
        className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-lg sm:p-8 ${getSkyClass(
          current.weather_code,
        )}`}
      >
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-start gap-1">
              <span className="font-display text-7xl font-bold leading-none tabular-nums tracking-tight sm:text-8xl">
                {Math.round(current.temperature_2m)}
              </span>
              <span className="mt-2 text-2xl font-semibold opacity-80">{ts}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <WeatherIcon icon={info.icon} className="size-6" />
              <span className="text-lg font-medium">{info.text}</span>
            </div>
            <p className="mt-1 text-sm font-medium opacity-80">
              High {maxes[0]}° &middot; Low {mins[0]}°
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.label}
                  className="flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm"
                >
                  <Icon className="size-5 opacity-90" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-xs font-medium opacity-75">{s.label}</span>
                    <span className="text-sm font-semibold tabular-nums">{s.value}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Tonight */}
      {tonight && (
        <SectionCard title="Tonight" icon={<MoonStar className="size-4" />}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <WeatherIcon
                icon={getWeatherInfo(tonight.code).icon}
                night
                className="size-9 text-primary"
              />
              <div className="flex flex-col leading-tight">
                <span className="font-semibold">{getWeatherInfo(tonight.code).text}</span>
                <span className="text-sm text-muted-foreground">
                  Low <strong className="text-foreground">{tonight.low}°</strong>
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Droplet, label: 'Precip', value: `${tonight.precip}%` },
                { icon: Wind, label: 'Wind', value: `${tonight.wind} ${wl}` },
                { icon: Droplets, label: 'Humidity', value: `${tonight.humidity}%` },
              ].map((s) => {
                const Icon = s.icon
                return (
                  <div
                    key={s.label}
                    className="flex flex-col items-center gap-1 rounded-2xl bg-secondary px-3 py-2.5 text-center"
                  >
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                    <span className="text-sm font-semibold tabular-nums">{s.value}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </SectionCard>
      )}

      {/* Hourly strip */}
      <SectionCard title="Hourly" icon={<Clock className="size-4" />}>
        <div className="thin-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-3">
          {hours.map((h, i) => {
            const hi = getWeatherInfo(h.code)
            return (
              <div
                key={i}
                className="flex min-w-[68px] flex-col items-center gap-2 rounded-2xl border border-border/60 bg-secondary/50 px-3 py-3"
              >
                <span className="text-xs font-medium text-muted-foreground">{h.time}</span>
                <WeatherIcon icon={hi.icon} className="size-6 text-primary" />
                <span className="text-sm font-semibold tabular-nums">{h.temp}°</span>
                {h.precip > 10 && (
                  <span className="flex items-center gap-0.5 text-[11px] font-medium text-accent">
                    <Droplet className="size-3" />
                    {h.precip}%
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </SectionCard>

      {/* 7-day summary */}
      <SectionCard title="7-Day Forecast" icon={<CalendarDays className="size-4" />}>
        <div className="flex flex-col">
          {daily.time.slice(0, 7).map((day, i) => {
            const hi = getWeatherInfo(daily.weather_code[i])
            const leftPct = (((mins[i] - weekLow) / weekRange) * 100).toFixed(1)
            const widthPct = (((maxes[i] - mins[i]) / weekRange) * 100).toFixed(1)
            return (
              <div
                key={day}
                className="grid grid-cols-[minmax(88px,1fr)_auto_1.4fr] items-center gap-3 border-b border-border/50 py-2.5 last:border-0 sm:grid-cols-[130px_28px_1fr_1.6fr]"
              >
                <span className="text-sm font-medium">
                  {i === 0 ? 'Today' : formatDay(day)}
                </span>
                <WeatherIcon icon={hi.icon} className="size-6 text-primary" />
                <span className="hidden truncate text-sm text-muted-foreground sm:block">
                  {hi.text}
                </span>
                <div className="flex items-center gap-2.5">
                  <span className="w-8 text-right text-sm text-muted-foreground tabular-nums">
                    {mins[i]}°
                  </span>
                  <div className="relative h-1.5 flex-1 rounded-full bg-secondary">
                    <div
                      className="absolute inset-y-0 rounded-full bg-gradient-to-r from-primary to-accent"
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    />
                  </div>
                  <span className="w-8 text-sm font-semibold tabular-nums">{maxes[i]}°</span>
                </div>
              </div>
            )
          })}
        </div>
      </SectionCard>
    </div>
  )
}
