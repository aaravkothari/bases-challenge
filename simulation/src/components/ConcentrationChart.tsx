import { useMemo, useState } from 'react'
import { scaleLinear } from 'd3-scale'
import { line as d3line, area as d3area } from 'd3-shape'
import { useMeasure } from '../hooks/useMeasure'
import { fmt, fmtTime } from '../lib/format'
import { concentrationAnalytic, type PKMetrics, type PKParams } from '../model/pk'

interface Curve { t: Float64Array; C: Float64Array }
interface Envelope { t: Float64Array; p05: Float64Array; p95: Float64Array }

interface Props {
  earth: PKParams
  space: PKParams
  curves: { earth: Curve; space: Curve }
  metrics: { earth: PKMetrics; space: PKMetrics }
  envelope: Envelope | null
  time: number
  onScrub: (t: number) => void
  height?: number
}

const M = { top: 18, right: 16, bottom: 36, left: 50 }
const EARTH = 'var(--color-earth)', SPACE = 'var(--color-space)'

export function ConcentrationChart({ earth, space, curves, metrics, envelope, time, onScrub, height = 320 }: Props) {
  const [ref, { width }] = useMeasure<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const W = Math.max(320, width), H = height
  const iw = W - M.left - M.right, ih = H - M.top - M.bottom

  const yMax = useMemo(() => {
    let m = Math.max(metrics.earth.cmax, metrics.space.cmax)
    if (envelope) for (const v of envelope.p95) m = Math.max(m, v)
    return m * 1.1 || 1
  }, [metrics, envelope])
  const x = useMemo(() => scaleLinear().domain([0, 24]).range([0, iw]), [iw])
  const y = useMemo(() => scaleLinear().domain([0, yMax]).range([ih, 0]).nice(5), [yMax, ih])

  const path = (c: Curve) => d3line<number>().x((i) => x(c.t[i])).y((i) => y(c.C[i]))(Array.from(c.t.keys())) ?? ''
  const band = envelope
    ? d3area<number>().x((i) => x(envelope.t[i])).y0((i) => y(envelope.p05[i])).y1((i) => y(envelope.p95[i]))(Array.from(envelope.t.keys())) ?? ''
    : null

  const tFromEvent = (e: React.MouseEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return Math.min(24, Math.max(0, x.invert(e.clientX - r.left)))
  }
  const ce = hover != null ? concentrationAnalytic(earth, hover) : null
  const cs = hover != null ? concentrationAnalytic(space, hover) : null

  return (
    <div ref={ref} className="relative w-full select-none">
      <svg width={W} height={H} role="img" aria-label="Plasma concentration versus time">
        <g transform={`translate(${M.left},${M.top})`}>
          {y.ticks(5).map((v) => <line key={v} x2={iw} y1={y(v)} y2={y(v)} stroke="var(--color-line)" />)}
          {band && <path d={band} fill="rgba(34,211,238,0.10)" stroke="rgba(34,211,238,0.3)" />}
          <path d={path(curves.earth)} fill="none" stroke={EARTH} strokeWidth={1.8} />
          <path d={path(curves.space)} fill="none" stroke={SPACE} strokeWidth={2} />
          <circle cx={x(metrics.earth.tmax)} cy={y(metrics.earth.cmax)} r={3.5} fill="var(--color-bg)" stroke={EARTH} strokeWidth={1.5} />
          <circle cx={x(metrics.space.tmax)} cy={y(metrics.space.cmax)} r={3.5} fill="var(--color-bg)" stroke={SPACE} strokeWidth={1.5} />

          <line x1={x(time)} x2={x(time)} y2={ih} stroke="var(--color-ink-2)" />
          <circle cx={x(time)} cy={y(concentrationAnalytic(earth, time))} r={4} fill={EARTH} stroke="var(--color-bg)" strokeWidth={2} />
          <circle cx={x(time)} cy={y(concentrationAnalytic(space, time))} r={4} fill={SPACE} stroke="var(--color-bg)" strokeWidth={2} />
          <text x={x(time)} y={-6} textAnchor="middle" fontSize={10} fill="var(--color-ink-2)" className="mono">{fmtTime(time)} h</text>
          <text x={x(5)} y={y(concentrationAnalytic(space, 5)) - 8} fontSize={12} fill={SPACE}>in space</text>
          <text x={x(5)} y={y(concentrationAnalytic(earth, 5)) + 16} fontSize={12} fill={EARTH}>on Earth</text>

          {hover != null && <line x1={x(hover)} x2={x(hover)} y2={ih} stroke="var(--color-ink-3)" strokeDasharray="3 3" />}

          <line x2={iw} y1={ih} y2={ih} stroke="var(--color-line-2)" />
          {x.ticks(12).map((v) => <text key={v} x={x(v)} y={ih + 14} textAnchor="middle" fontSize={10} fill="var(--color-ink-3)" className="mono">{v}</text>)}
          {y.ticks(5).map((v) => <text key={v} x={-8} y={y(v)} dy="0.32em" textAnchor="end" fontSize={10} fill="var(--color-ink-3)" className="mono">{fmt(v, 2)}</text>)}
          <text x={iw / 2} y={ih + 30} textAnchor="middle" fontSize={11} fill="var(--color-ink-2)">hours after dose</text>
          <text transform={`translate(-38,${ih / 2}) rotate(-90)`} textAnchor="middle" fontSize={11} fill="var(--color-ink-2)">drug level in blood, mg/L</text>

          <rect width={iw} height={ih} fill="transparent" style={{ cursor: 'crosshair' }}
            onMouseMove={(e) => { const t = tFromEvent(e); setHover(t); if (e.buttons === 1) onScrub(t) }}
            onMouseLeave={() => setHover(null)}
            onMouseDown={(e) => onScrub(tFromEvent(e))} />
        </g>
      </svg>
      {hover != null && ce != null && cs != null && (
        <div className="absolute pointer-events-none px-2 py-1.5 text-[11px] mono leading-snug border border-line"
          style={{ left: M.left + x(hover) + (x(hover) > iw - 130 ? -130 : 10), top: M.top + 6, background: 'rgba(6,9,14,0.96)' }}>
          <div className="text-ink-3">{fmtTime(hover)} h</div>
          <div className="text-earth">Earth {fmt(ce)}</div>
          <div className="text-space">Space {fmt(cs)}</div>
        </div>
      )}
    </div>
  )
}
