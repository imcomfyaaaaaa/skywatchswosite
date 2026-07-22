'use client'

import { AlertTriangle, ExternalLink } from 'lucide-react'
import type { NHCStorm, Settings } from '@/lib/weather'

export function HurricaneWidget({
  storms,
  settings,
}: {
  storms: NHCStorm[]
  settings: Settings
}) {
  if (!storms || storms.length === 0) return null

  return (
    <section className="flex flex-col border-b border-border py-6">
      <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-destructive">
        <AlertTriangle className="size-4" />
        <span className="font-semibold">Active Storms</span>
      </div>
      <div className="flex flex-col gap-4">
        {storms.map((storm) => {
          // Convert intensity from knots to selected unit
          const knots = parseInt(storm.intensity, 10) || 0
          let speedStr = `${knots} kt`
          if (settings.windUnit === 'mph') {
            speedStr = `${Math.round(knots * 1.15078)} mph`
          } else if (settings.windUnit === 'kmh') {
            speedStr = `${Math.round(knots * 1.852)} km/h`
          }

          let catLabel = 'Tropical Cyclone'
          if (storm.classification === 'HU') catLabel = 'Hurricane'
          if (storm.classification === 'TS') catLabel = 'Tropical Storm'
          if (storm.classification === 'TD') catLabel = 'Tropical Depression'

          return (
            <div key={storm.id} className="flex flex-col gap-1 border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center justify-between">
                <span className="text-lg font-light tracking-tight">{storm.name}</span>
                <span className="text-sm font-semibold tabular-nums text-destructive">{speedStr}</span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {catLabel}
              </span>
              {storm.publicAdvisory?.url && (
                <a
                  href={storm.publicAdvisory.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex w-max items-center gap-1 text-xs font-semibold text-primary transition hover:underline"
                >
                  Read Advisory <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
