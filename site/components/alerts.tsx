'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, ChevronRight, X, MapPin, Clock, Timer } from 'lucide-react'
import type { WeatherAlert } from '@/lib/weather'

function isWarning(severity: string) {
  const s = severity.toLowerCase()
  return s === 'minor' || s === 'moderate'
}

function fmt(d: string) {
  try {
    return new Date(d).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return d
  }
}

export function AlertsBar({ alerts }: { alerts: WeatherAlert[] }) {
  const [selected, setSelected] = useState<WeatherAlert | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelected(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  if (!alerts.length) return null

  return (
    <div className="flex flex-col gap-2">
      {alerts.map((a) => {
        const warn = isWarning(a.severity)
        return (
          <button
            key={a.title}
            onClick={() => setSelected(a)}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
              warn
                ? 'border-warning/40 bg-warning/15 text-warning-foreground hover:bg-warning/25'
                : 'border-destructive/40 bg-destructive/15 text-foreground hover:bg-destructive/25'
            }`}
          >
            <AlertTriangle
              className={`size-5 shrink-0 ${warn ? 'text-warning' : 'text-destructive'}`}
            />
            <span className="flex-1 truncate text-sm font-semibold">{a.title}</span>
            <ChevronRight className="size-4 shrink-0 opacity-60" />
          </button>
        )
      })}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
          >
            <div
              className={`flex items-center justify-between px-5 py-4 ${
                isWarning(selected.severity)
                  ? 'bg-warning/20 text-warning-foreground'
                  : 'bg-destructive/20 text-foreground'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle
                  className={`size-5 ${
                    isWarning(selected.severity) ? 'text-warning' : 'text-destructive'
                  }`}
                />
                <span className="text-pretty">{selected.title}</span>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close alert"
                className="flex size-8 shrink-0 items-center justify-center rounded-full transition hover:bg-black/10"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto px-5 py-5 text-sm leading-relaxed">
              {selected.areaDesc && (
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>
                    <strong>Area:</strong> {selected.areaDesc}
                  </span>
                </p>
              )}
              {selected.effective && (
                <p className="flex items-start gap-2">
                  <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>
                    <strong>Effective:</strong> {fmt(selected.effective)}
                  </span>
                </p>
              )}
              {selected.expires && (
                <p className="flex items-start gap-2">
                  <Timer className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>
                    <strong>Expires:</strong> {fmt(selected.expires)}
                  </span>
                </p>
              )}
              {selected.description && (
                <>
                  <hr className="border-border" />
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {selected.description.trim()}
                  </p>
                </>
              )}
              {selected.instruction && (
                <>
                  <hr className="border-border" />
                  <p>
                    <strong>What to do:</strong>
                    <br />
                    <span className="text-muted-foreground">{selected.instruction.trim()}</span>
                  </p>
                </>
              )}
              {selected.sender && (
                <p className="mt-1 text-xs text-muted-foreground">Issued by {selected.sender}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
