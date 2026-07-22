'use client'

import { useEffect } from 'react'
import { Settings as SettingsIcon, X, Check, Moon, Sun } from 'lucide-react'
import type { Settings } from '@/lib/weather'

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: React.ReactNode }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex rounded-full border border-border bg-secondary/60 p-1">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              value === o.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function SettingsDialog({
  open,
  settings,
  onChange,
  onClose,
}: {
  open: boolean
  settings: Settings
  onChange: (patch: Partial<Settings>) => void
  onClose: () => void
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <SettingsIcon className="size-5 text-primary" />
            Settings
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-5 py-6">
          <Segmented
            label="Temperature"
            value={settings.tempUnit}
            onChange={(v) => onChange({ tempUnit: v })}
            options={[
              { value: 'celsius', label: '°C' },
              { value: 'fahrenheit', label: '°F' },
            ]}
          />
          <Segmented
            label="Wind Speed"
            value={settings.windUnit}
            onChange={(v) => onChange({ windUnit: v })}
            options={[
              { value: 'kmh', label: 'km/h' },
              { value: 'mph', label: 'mph' },
            ]}
          />
          <Segmented
            label="Theme"
            value={settings.theme}
            onChange={(v) => onChange({ theme: v })}
            options={[
              { value: 'dark', label: <><Moon className="size-3.5" /> Dark</> },
              { value: 'light', label: <><Sun className="size-3.5" /> Light</> },
            ]}
          />
        </div>

        <div className="border-t border-border px-5 py-4">
          <button
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Check className="size-4" />
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
