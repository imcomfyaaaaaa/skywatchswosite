'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { searchGeo, geoLabel, type GeoResult } from '@/lib/weather'

export function SearchBox({
  onSelect,
}: {
  onSelect: (r: GeoResult) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeoResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  function handleChange(v: string) {
    setQuery(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (v.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      const r = await searchGeo(v, 5)
      setResults(r)
      setOpen(r.length > 0)
      setLoading(false)
    }, 300)
  }

  async function pick(r: GeoResult) {
    onSelect(r)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  async function submitFirst() {
    const r = results[0] ?? (await searchGeo(query, 1))[0]
    if (r) pick(r)
  }

  return (
    <div ref={wrapRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/70 px-4 py-2 transition focus-within:border-primary focus-within:bg-card">
        {loading ? (
          <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <Search className="size-4 shrink-0 text-muted-foreground" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing || e.keyCode === 229) return
            if (e.key === 'Enter') submitFirst()
            if (e.key === 'Escape') setOpen(false)
          }}
          placeholder="Search any city…"
          autoComplete="off"
          spellCheck={false}
          aria-label="Search for a city"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-popover shadow-xl shadow-black/10">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => pick(r)}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-popover-foreground transition hover:bg-secondary"
            >
              <MapPin className="size-4 shrink-0 text-primary" />
              <span className="truncate">{geoLabel(r)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
