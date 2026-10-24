import { describe, it, expect } from 'vitest'
import { tornado, monteCarlo, DEFAULT_MC_CONFIG } from './sensitivity'
import { REFERENCE_PARAMS, EXAMPLE_SCENARIO, applyScenario, computeMetrics } from './pk'

const space = applyScenario(REFERENCE_PARAMS, EXAMPLE_SCENARIO)

describe('tornado (one-at-a-time)', () => {
  const rows = tornado(space, { ka: [0.6, 1.4], CL: [0.6, 1.4], Vd: [0.6, 1.4], F: [0.6, 1.0] })

  it('returns one row per parameter with low/high metrics relative to baseline', () => {
    expect(rows.map((r) => r.param).sort()).toEqual(['CL', 'F', 'Vd', 'ka'])
    const base = computeMetrics(space)
    for (const r of rows) {
      expect(r.base.cmax).toBeCloseTo(base.cmax, 12)
      expect(r.base.auc24).toBeCloseTo(base.auc24, 12)
    }
  })

  it('reports that CL does not affect Cmax much but strongly affects AUC, and ka does not affect AUC0-inf', () => {
    const cl = rows.find((r) => r.param === 'CL')!
    expect(cl.low.auc24).toBeGreaterThan(cl.base.auc24)
    expect(cl.high.auc24).toBeLessThan(cl.base.auc24)
    const ka = rows.find((r) => r.param === 'ka')!
    expect(ka.low.aucInf).toBeCloseTo(ka.base.aucInf, 12)
    expect(ka.low.cmax).toBeLessThan(ka.base.cmax)
  })

  it('does not mutate the input', () => {
    const copy = { ...space }
    tornado(space, { ka: [0.5, 1.5], CL: [0.5, 1.5], Vd: [0.5, 1.5], F: [0.5, 1] })
    expect(space).toEqual(copy)
  })
})

describe('monteCarlo', () => {
  it('is reproducible for the same seed and differs for different seeds', () => {
    const a = monteCarlo(REFERENCE_PARAMS, { ...DEFAULT_MC_CONFIG, n: 300, seed: 11 })
    const b = monteCarlo(REFERENCE_PARAMS, { ...DEFAULT_MC_CONFIG, n: 300, seed: 11 })
    const c = monteCarlo(REFERENCE_PARAMS, { ...DEFAULT_MC_CONFIG, n: 300, seed: 12 })
    expect(Array.from(a.cmax)).toEqual(Array.from(b.cmax))
    expect(Array.from(a.cmax)).not.toEqual(Array.from(c.cmax))
  })

  it('produces the requested number of samples and ordered percentile envelopes', () => {
    const r = monteCarlo(REFERENCE_PARAMS, { ...DEFAULT_MC_CONFIG, n: 500, seed: 1 })
    expect(r.cmax.length).toBe(500)
    expect(r.auc24.length).toBe(500)
    expect(r.envelope.t.length).toBe(r.envelope.p50.length)
    for (let i = 0; i < r.envelope.t.length; i++) {
      expect(r.envelope.p05[i]).toBeLessThanOrEqual(r.envelope.p50[i] + 1e-12)
      expect(r.envelope.p50[i]).toBeLessThanOrEqual(r.envelope.p95[i] + 1e-12)
      expect(r.envelope.p05[i]).toBeGreaterThanOrEqual(0)
    }
    expect(r.envelope.p50[0]).toBe(0)
  })

  it('never exceeds F = 1 for sampled bioavailability', () => {
    const r = monteCarlo(
      { ...REFERENCE_PARAMS, F: 0.95 },
      { ...DEFAULT_MC_CONFIG, n: 400, seed: 2, F: { kind: 'uniform', min: 0.9, max: 1.3 } },
    )
    for (const s of r.samples) expect(s.F).toBeLessThanOrEqual(1)
  })

  it('collapses to the deterministic result when all distributions are fixed', () => {
    const r = monteCarlo(REFERENCE_PARAMS, {
      n: 50,
      seed: 5,
      ka: { kind: 'fixed', value: 0.8 },
      CL: { kind: 'fixed', value: 0.75 },
      Vd: { kind: 'fixed', value: 0.85 },
      F: { kind: 'fixed', value: 1 },
    })
    const m = computeMetrics(space)
    for (const v of r.cmax) expect(v).toBeCloseTo(m.cmax, 10)
    expect(r.stats.cmax.p50).toBeCloseTo(m.cmax, 10)
    expect(r.stats.auc24.p05).toBeCloseTo(m.auc24, 10)
  })
})
