'use client'

import { useEffect, useRef, useState } from 'react'
import { Radio, Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import type { Map as LeafletMap, TileLayer } from 'leaflet'
import type { Coords } from '@/lib/weather'

export function RadarView({ coords }: { coords: Coords }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const layersRef = useRef<TileLayer[]>([])
  const timestampsRef = useRef<number[]>([])
  const posRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [playing, setPlaying] = useState(false)
  const [timeLabel, setTimeLabel] = useState('Loading radar…')

  // Init map once
  useEffect(() => {
    let cancelled = false
    async function setup() {
      const L = (await import('leaflet')).default as typeof import('leaflet')
      if (cancelled || !containerRef.current || mapRef.current) return

      const map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: true,
        minZoom: 3,
        maxZoom: 10,
      }).setView([coords.lat, coords.lon], 7)
      mapRef.current = map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map)

      await loadFrames(L, map)
    }
    setup()
    return () => {
      cancelled = true
      if (intervalRef.current) clearInterval(intervalRef.current)
      mapRef.current?.remove()
      mapRef.current = null
      layersRef.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recenter when coords change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.setView([coords.lat, coords.lon], 7)
    setTimeout(() => map.invalidateSize(), 100)
  }, [coords])

  async function loadFrames(L: typeof import('leaflet'), map: LeafletMap) {
    try {
      const res = await fetch('https://api.rainviewer.com/public/weather-maps.json')
      const data = await res.json()
      if (!data.radar?.past) {
        setTimeLabel('Radar unavailable')
        return
      }
      layersRef.current.forEach((l) => map.removeLayer(l))
      layersRef.current = []
      timestampsRef.current = []

      const frames = [...data.radar.past]
      if (data.radar.nowcast?.length) frames.push(data.radar.nowcast[0])

      frames.forEach((frame: { path: string; time: number }) => {
        const layer = L.tileLayer(
          `https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/2/1_1.png`,
          { opacity: 0, zIndex: 10 },
        )
        layer.addTo(map)
        layersRef.current.push(layer)
        timestampsRef.current.push(frame.time)
      })
      showFrame(layersRef.current.length - 1)
    } catch {
      setTimeLabel('Radar error')
    }
  }

  function showFrame(idx: number) {
    const layers = layersRef.current
    if (!layers.length) return
    const pos = (idx + layers.length) % layers.length
    posRef.current = pos
    layers.forEach((l, i) => l.setOpacity(i === pos ? 0.75 : 0))
    setTimeLabel(
      new Date(timestampsRef.current[pos] * 1000).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    )
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    setPlaying(false)
  }

  function toggle() {
    if (intervalRef.current) {
      stop()
      return
    }
    setPlaying(true)
    intervalRef.current = setInterval(() => showFrame(posRef.current + 1), 1000)
  }

  return (
    <section className="border-b border-border py-6">
      <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <Radio className="size-4" />
        <h2 className="font-semibold">Live Radar</h2>
      </div>

      <div
        ref={containerRef}
        className="h-[420px] w-full overflow-hidden border border-border/50 sm:h-[500px]"
      />

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          onClick={() => {
            stop()
            showFrame(posRef.current - 1)
          }}
          aria-label="Previous frame"
          className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <SkipBack className="size-4" />
        </button>
        <button
          onClick={toggle}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={() => {
            stop()
            showFrame(posRef.current + 1)
          }}
          aria-label="Next frame"
          className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <SkipForward className="size-4" />
        </button>
        <span className="ml-2 min-w-[72px] text-sm font-medium tabular-nums text-muted-foreground">
          {timeLabel}
        </span>
      </div>
    </section>
  )
}
