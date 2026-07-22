'use client'

import { Bookmark, Sunrise, Sunset, X } from 'lucide-react'
import { WeatherIcon } from '@/components/weather-icon'
import { getWeatherInfo, formatTime, type Favorite, type WeatherResponse } from '@/lib/weather'

export function Sidebar({
  favorites,
  onSelectFavorite,
  onRemoveFavorite,
  data,
}: {
  favorites: Favorite[]
  onSelectFavorite: (f: Favorite) => void
  onRemoveFavorite: (name: string) => void
  data: WeatherResponse | null
}) {
  const sunrise = data?.daily.sunrise?.[0]
  const sunset = data?.daily.sunset?.[0]

  return (
    <aside className="flex flex-col gap-4">
      {/* Saved locations */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Bookmark className="size-4" />
          <span>Saved Locations</span>
        </div>
        {favorites.length === 0 ? (
          <p className="rounded-2xl bg-secondary/60 px-4 py-6 text-center text-sm text-muted-foreground text-pretty">
            No saved locations yet. Tap the star near a city name to save it.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {favorites.map((f) => {
              const info = getWeatherInfo(f.code)
              return (
                <div
                  key={f.name}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectFavorite(f)}
                  onKeyDown={(e) => e.key === 'Enter' && onSelectFavorite(f)}
                  className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-border/60 bg-secondary/40 px-3 py-2.5 transition hover:border-primary/40 hover:bg-secondary"
                >
                  <WeatherIcon icon={info.icon} className="size-6 shrink-0 text-primary" />
                  <div className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate text-sm font-semibold">{f.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{f.desc}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{f.temp}°</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveFavorite(f.name)
                    }}
                    aria-label={`Remove ${f.name}`}
                    className="flex size-6 items-center justify-center rounded-full text-muted-foreground opacity-0 transition hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Sun & Moon */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Sunrise className="size-4" />
          <span>Sun &amp; Moon</span>
        </div>
        <div className="flex items-center justify-around gap-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-warning/20 text-warning">
              <Sunrise className="size-5" />
            </span>
            <span className="text-xs text-muted-foreground">Sunrise</span>
            <span className="text-sm font-semibold tabular-nums">
              {sunrise ? formatTime(sunrise) : '--:--'}
            </span>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-accent/20 text-accent">
              <Sunset className="size-5" />
            </span>
            <span className="text-xs text-muted-foreground">Sunset</span>
            <span className="text-sm font-semibold tabular-nums">
              {sunset ? formatTime(sunset) : '--:--'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
