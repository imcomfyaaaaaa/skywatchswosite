'use client'

import { Sunrise, Sunset } from 'lucide-react'
import { formatTime, type WeatherResponse } from '@/lib/weather'

export function SunMoonWidget({ data }: { data: WeatherResponse | null }) {
  const sunrise = data?.daily.sunrise?.[0]
  const sunset = data?.daily.sunset?.[0]

  return (
    <section className="flex h-full flex-col justify-between border-b border-border py-6">
      <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <Sunrise className="size-4" />
        <span className="font-semibold">Sun &amp; Moon</span>
      </div>
      <div className="flex flex-1 items-center justify-around gap-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <Sunrise className="size-6 text-foreground/70" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Sunrise</span>
          <span className="text-xl font-light tabular-nums tracking-tight">
            {sunrise ? formatTime(sunrise) : '--:--'}
          </span>
        </div>
        <div className="h-12 w-px bg-border/50" />
        <div className="flex flex-col items-center gap-2 text-center">
          <Sunset className="size-6 text-foreground/70" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Sunset</span>
          <span className="text-xl font-light tabular-nums tracking-tight">
            {sunset ? formatTime(sunset) : '--:--'}
          </span>
        </div>
      </div>
    </section>
  )
}
