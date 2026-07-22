'use client'

import { Bookmark, X } from 'lucide-react'
import { WeatherIcon } from '@/components/weather-icon'
import { getWeatherInfo, type Favorite } from '@/lib/weather'

export function SavedLocationsWidget({
  favorites,
  onSelectFavorite,
  onRemoveFavorite,
}: {
  favorites: Favorite[]
  onSelectFavorite: (f: Favorite) => void
  onRemoveFavorite: (name: string) => void
}) {
  return (
    <section className="flex h-full flex-col border-b border-border py-6">
      <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <Bookmark className="size-4" />
        <span className="font-semibold">Saved Locations</span>
      </div>
      {favorites.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="rounded-2xl bg-secondary/60 px-4 py-6 text-center text-sm text-muted-foreground text-pretty">
            No saved locations yet. Tap the star to save one.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px]">
          {favorites.map((f) => {
            const info = getWeatherInfo(f.code)
            return (
              <div
                key={f.name}
                role="button"
                tabIndex={0}
                onClick={() => onSelectFavorite(f)}
                onKeyDown={(e) => e.key === 'Enter' && onSelectFavorite(f)}
                className="group flex cursor-pointer items-center gap-3 border-b border-border/50 py-3 transition hover:bg-secondary/30"
              >
                <WeatherIcon icon={info.icon} className="size-6 shrink-0 text-primary" />
                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate text-sm font-semibold">{f.name}</span>
                  <span className="truncate text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{f.desc}</span>
                </div>
                <span className="text-xl font-light tabular-nums">{f.temp}°</span>
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
    </section>
  )
}
