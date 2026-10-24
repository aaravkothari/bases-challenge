import { useMemo } from 'react'
import { line as d3line, curveCatmullRomClosed } from 'd3-shape'
import { mulberry32 } from '../model/random'
import { fmt } from '../lib/format'
import type { Simulation } from '../model/pk'
import type { Condition } from '../hooks/useSimulation'

// Schematic geometry in a 0 0 470 630 viewBox; body axis at x = 150.
const LEFT: [number, number][] = [
  [139, 88], [138, 104], [120, 110], [98, 118], [82, 132], [72, 160], [64, 200], [58, 245], [50, 290], [44, 330],
  [41, 350], [48, 366], [59, 361], [67, 342], [73, 300], [81, 250], [89, 206], [95, 198], [99, 202],
  [101, 240], [99, 280], [101, 312], [107, 342], [111, 372], [109, 420], [105, 470], [107, 500], [109, 540], [113, 580],
  [111, 600], [118, 612], [136, 612], [142, 598], [142, 560], [142, 520], [144, 500], [146, 450], [148, 410], [150, 394],
]
const BODY = d3line<[number, number]>().curve(curveCatmullRomClosed.alpha(0.6))([
  ...LEFT, ...[...LEFT].reverse().map(([x, y]) => [300 - x, y] as [number, number]),
]) ?? ''

const LOOPS = [
  { d: 'M158,196 C154,240 150,280 150,330 C150,360 146,380 136,420 C128,460 126,520 126,598 C130,604 136,604 138,598 C140,520 142,460 148,420 C156,380 158,360 158,330 C158,280 160,240 164,196 Z', dur: 7 },
  { d: 'M160,196 C156,240 152,280 152,330 C152,360 156,380 166,420 C172,460 176,520 176,598 C172,604 166,604 164,598 C162,520 160,460 156,420 C150,380 146,360 146,330 C146,280 148,240 154,196 Z', dur: 7.4 },
  { d: 'M156,176 C120,150 90,160 72,200 C62,240 54,290 48,340 C52,348 58,346 60,340 C66,292 72,244 84,210 C100,176 124,176 156,186 C188,176 212,176 228,210 C240,244 246,292 252,340 C254,346 260,348 264,340 C258,290 250,240 240,200 C222,160 192,150 156,176 Z', dur: 8.2 },
  { d: 'M152,176 C150,140 146,110 146,60 C148,54 154,54 156,60 C156,110 160,140 162,176 C160,182 154,182 152,176 Z', dur: 4.6 },
]
const RENAL = ['M114,312 C118,340 136,352 148,372', 'M186,312 C182,340 164,352 152,372']
const GUT = 'M124,284 C142,274 160,292 178,282 C186,294 172,306 152,302 C132,298 118,308 122,320 C128,332 160,328 178,322 C186,332 172,346 150,344 C130,342 120,348 126,354'
const COLON = 'M116,268 L116,346 M116,268 L184,268 M184,268 L184,346 C184,358 166,364 152,362'

const N_GI = 40, N_SYS = 52, N_ELIM = 14
const GI_POS: [number, number][] = (() => {
  const rng = mulberry32(1234)
  const pts: [number, number][] = []
  while (pts.length < N_GI) {
    if (rng() < 0.35) {
      const a = rng() * Math.PI * 2, r = Math.sqrt(rng()) * 17
      pts.push([176 + Math.cos(a) * r * 1.05, 244 + Math.sin(a) * r * 0.85])
    } else pts.push([126 + rng() * 48, 280 + rng() * 60])
  }
  return pts
})()

interface Props {
  sims: { earth: Simulation; space: Simulation }
  condition: Condition
  time: number
}

export function AnatomyView({ sims, condition, time }: Props) {
  const sim = sims[condition]
  const s = sim.stateAt(time)
  const dose = sim.params.dose
  const norms = useMemo(() => {
    const peak = (x: Simulation) => Math.max(...x.Ac)
    const pe = peak(sims.earth), ps = peak(sims.space)
    return {
      peakAc: Math.max(pe, ps),
      peakRate: Math.max((sims.earth.params.CL / sims.earth.params.Vd) * pe, (sims.space.params.CL / sims.space.params.Vd) * ps),
    }
  }, [sims])

  const frac = norms.peakAc > 0 ? s.Ac / norms.peakAc : 0
  const rate = (sim.params.CL / sim.params.Vd) * s.Ac
  const nGi = Math.round((N_GI * s.Ag) / dose)
  const nSys = Math.round(N_SYS * frac)
  const nElim = Math.round((N_ELIM * rate) / (norms.peakRate || 1))
  const space = condition === 'space'
  const accent = space ? 'var(--color-space)' : 'var(--color-earth)'
  const rgb = space ? '34,211,238' : '127,142,166'

  return (
    <svg viewBox="0 0 470 630" className="w-full h-auto" role="img" aria-label="Where the drug is in the body">
      <defs>
        <radialGradient id="glow" cx="50%" cy="38%" r="60%">
          <stop offset="0%" stopColor={`rgba(${rgb},${0.22 * frac})`} />
          <stop offset="100%" stopColor={`rgba(${rgb},0)`} />
        </radialGradient>
        <clipPath id="body"><path d={BODY} /><ellipse cx={150} cy={52} rx={24} ry={30} /></clipPath>
      </defs>

      <ellipse cx={150} cy={52} rx={24} ry={30} fill="rgba(159,179,200,0.07)" stroke="rgba(159,179,200,0.35)" />
      <path d={BODY} fill="rgba(159,179,200,0.07)" stroke="rgba(159,179,200,0.35)" />
      <g clipPath="url(#body)"><rect width={300} height={630} fill="url(#glow)" className="fade" /></g>

      <g fill="none" stroke={`rgba(${rgb},0.28)`}>{LOOPS.map((l, i) => <path key={i} d={l.d} />)}</g>

      <g fill="rgba(233,180,76,0.14)" stroke="rgba(233,180,76,0.6)">
        <path d="M118,282 C108,282 104,294 106,306 C108,318 116,324 122,320 C118,312 118,300 122,290 C120,286 120,283 118,282 Z" />
        <path d="M182,282 C192,282 196,294 194,306 C192,318 184,324 178,320 C182,312 182,300 178,290 C180,286 180,283 182,282 Z" />
        <path d="M100,224 C110,212 142,210 160,218 L162,244 C152,262 118,268 106,256 C100,248 98,234 100,224 Z" />
      </g>
      <ellipse cx={150} cy={378} rx={10} ry={7} fill="rgba(233,180,76,0.08)" stroke="rgba(233,180,76,0.4)" />
      <g fill="none" stroke="rgba(233,180,76,0.35)" strokeDasharray="2 3">{RENAL.map((d) => <path key={d} d={d} />)}</g>

      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={COLON} stroke="rgba(159,179,200,0.18)" strokeWidth={11} />
        <path d={COLON} stroke="rgba(159,179,200,0.45)" />
        <path d={GUT} stroke="rgba(159,179,200,0.16)" strokeWidth={8} />
        <path d={GUT} stroke="rgba(159,179,200,0.5)" />
      </g>
      <path d="M158,222 C176,210 198,222 198,244 C198,264 180,276 164,272 C150,268 148,250 156,238 C156,232 156,226 158,222 Z" fill={`rgba(${rgb},0.10)`} stroke={`rgba(${rgb},0.55)`} />
      <path d="M152,104 C152,150 156,190 158,222" fill="none" stroke="rgba(159,179,200,0.35)" />
      <path d="M158,168 C150,158 136,166 140,180 C144,194 158,202 158,202 C158,202 172,194 176,180 C180,166 166,158 158,168 Z" fill={`rgba(${rgb},0.18)`} stroke={accent} />

      {GI_POS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.8} fill={accent} className="fade drift"
          style={{ opacity: i < nGi ? 0.9 : 0, ['--dur' as string]: `${2.6 + (i % 5) * 0.4}s`, ['--delay' as string]: `${-(i % 7) * 0.5}s`, transformBox: 'fill-box', transformOrigin: 'center' }} />
      ))}
      {Array.from({ length: N_SYS }, (_, i) => {
        const loop = LOOPS[i % LOOPS.length]
        const start = (Math.floor(i / LOOPS.length) / Math.ceil(N_SYS / LOOPS.length)) * 100
        return (
          <circle key={i} r={1.9} fill={accent} className="fade flow"
            style={{ opacity: i < nSys ? 0.95 : 0, offsetPath: `path("${loop.d}")`, offsetDistance: `${start}%`, offsetRotate: '0deg', ['--dur' as string]: `${loop.dur}s`, ['--delay' as string]: `${-(start / 100) * loop.dur}s` }} />
        )
      })}
      {Array.from({ length: N_ELIM }, (_, i) => {
        const start = ((i >> 1) / (N_ELIM / 2)) * 100
        return (
          <circle key={i} r={1.6} fill="var(--color-amber)" className="fade flow"
            style={{ opacity: i < nElim ? 0.85 : 0, offsetPath: `path("${RENAL[i % 2]}")`, offsetDistance: `${start}%`, ['--dur' as string]: '3.2s', ['--delay' as string]: `${-(start / 100) * 3.2}s` }} />
        )
      })}

      <Label x={162} y={184} ly={150} color={accent} title="in the blood" lines={[`${fmt(s.Ac)} mg`, `${fmt(s.C)} mg/L level`]} />
      <Label x={197} y={244} ly={262} color={accent} title="in the gut" lines={[`${fmt(s.Ag)} mg`, `${fmt(s.An)} mg won't absorb`]} />
      <Label x={194} y={300} ly={360} color="var(--color-amber)" title="cleared" lines={[`${fmt(s.Ae)} mg`, `${fmt(rate)} mg/h`]} />
    </svg>
  )
}

function Label({ x, y, ly, color, title, lines }: { x: number; y: number; ly: number; color: string; title: string; lines: string[] }) {
  const lx = 288
  return (
    <g>
      <circle cx={x} cy={y} r={2.2} fill={color} />
      <path d={`M${x},${y} L${lx - 20},${ly} L${lx - 6},${ly}`} fill="none" stroke={color} strokeWidth={0.8} opacity={0.7} />
      <text x={lx} y={ly - 6} fontSize={15} fill={color}>{title}</text>
      {lines.map((l, i) => (
        <text key={i} x={lx} y={ly + 18 + i * 20} fontSize={i === 0 ? 19 : 13} fill={i === 0 ? 'var(--color-ink)' : 'var(--color-ink-3)'} className="mono">{l}</text>
      ))}
    </g>
  )
}
