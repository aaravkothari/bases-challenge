import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  REFERENCE_PARAMS, EXAMPLE_SCENARIO, NEUTRAL_SCENARIO,
  applyScenario, clampParams, clampScenario, computeMetrics, sampleCurve, simulateRK4,
  type PKParams, type ScenarioMultipliers,
} from '../model/pk'
import { monteCarlo } from '../model/sensitivity'

export type Condition = 'earth' | 'space'
export const T_END = 24

export function useSimulation() {
  const [earth, setEarthRaw] = useState<PKParams>({ ...REFERENCE_PARAMS })
  const [scenario, setScenarioRaw] = useState<ScenarioMultipliers>({ ...EXAMPLE_SCENARIO })
  const [condition, setCondition] = useState<Condition>('space')
  const [time, setTime] = useState(2)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [showEnvelope, setShowEnvelope] = useState(false)
  const [reducedMotion, setReducedMotion] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(reducedMotion)
  }, [reducedMotion])

  const setEarth = useCallback((patch: Partial<PKParams>) => setEarthRaw((p) => clampParams({ ...p, ...patch })), [])
  const setScenario = useCallback((patch: Partial<ScenarioMultipliers>) => setScenarioRaw((s) => clampScenario({ ...s, ...patch })), [])
  const reset = useCallback(() => { setEarthRaw({ ...REFERENCE_PARAMS }); setScenarioRaw({ ...NEUTRAL_SCENARIO }) }, [])
  const example = useCallback(() => { setEarthRaw({ ...REFERENCE_PARAMS }); setScenarioRaw({ ...EXAMPLE_SCENARIO }) }, [])

  const space = useMemo(() => applyScenario(earth, scenario), [earth, scenario])
  const metrics = useMemo(() => ({ earth: computeMetrics(earth), space: computeMetrics(space) }), [earth, space])
  const curves = useMemo(() => ({ earth: sampleCurve(earth, T_END, 481), space: sampleCurve(space, T_END, 481) }), [earth, space])
  const sims = useMemo(() => ({ earth: simulateRK4(earth, { tEnd: T_END, dt: 0.01 }), space: simulateRK4(space, { tEnd: T_END, dt: 0.01 }) }), [earth, space])

  // Seeded Monte Carlo around the current scenario multipliers. Spreads are illustrative.
  const mc = useMemo(() => {
    if (!showEnvelope) return null
    return monteCarlo(earth, {
      n: 400, seed: 7, nGrid: 121,
      ka: { kind: 'lognormal', median: scenario.aKa, cv: 0.2 },
      CL: { kind: 'lognormal', median: scenario.aCL, cv: 0.2 },
      Vd: { kind: 'lognormal', median: scenario.aV, cv: 0.12 },
      F: { kind: 'lognormal', median: scenario.aF, cv: 0.08 },
    })
  }, [showEnvelope, earth, scenario])

  const raf = useRef<number | null>(null)
  const last = useRef<number | null>(null)
  useEffect(() => {
    if (!playing) { last.current = null; return }
    const step = (now: number) => {
      if (last.current == null) last.current = now
      const dt = (now - last.current) / 1000
      last.current = now
      setTime((t) => (t + dt * speed >= T_END ? 0 : t + dt * speed))
      raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [playing, speed])

  const setTimeClamped = useCallback((t: number) => setTime(Math.min(T_END, Math.max(0, t))), [])

  return {
    earth, scenario, space, condition, time, playing, speed, showEnvelope, reducedMotion, metrics, curves, sims, mc,
    setEarth, setScenario, setCondition, setTime: setTimeClamped, setPlaying, setSpeed, setShowEnvelope, setReducedMotion, reset, example,
  }
}

export type Sim = ReturnType<typeof useSimulation>
