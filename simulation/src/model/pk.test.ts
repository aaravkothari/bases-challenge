import { describe, it, expect } from 'vitest'
import {
  REFERENCE_PARAMS,
  EXAMPLE_SCENARIO,
  applyScenario,
  derived,
  concentrationAnalytic,
  tmaxAnalytic,
  aucAnalytic,
  simulateRK4,
  computeMetrics,
  clampParams,
  type PKParams,
} from './pk'

const P: PKParams = { dose: 100, F: 0.85, ka: 1.2, CL: 7.2, Vd: 40 }

describe('derived quantities', () => {
  it('computes ke = CL/Vd and half-life = ln2/ke', () => {
    const d = derived(P)
    expect(d.ke).toBeCloseTo(0.18, 12)
    expect(d.tHalf).toBeCloseTo(Math.LN2 / 0.18, 12)
  })
})

describe('analytic solution', () => {
  it('is zero at t = 0', () => {
    expect(concentrationAnalytic(P, 0)).toBe(0)
  })

  it('matches the closed-form Bateman expression for ka != ke', () => {
    const t = 3
    const ke = P.CL / P.Vd
    const expected =
      ((P.F * P.dose * P.ka) / (P.Vd * (P.ka - ke))) *
      (Math.exp(-ke * t) - Math.exp(-P.ka * t))
    expect(concentrationAnalytic(P, t)).toBeCloseTo(expected, 12)
  })

  it('is numerically stable and continuous when ka approaches ke', () => {
    const base: PKParams = { ...P, CL: 0.18 * 40 } // ke = 0.18
    const exact = { ...base, ka: 0.18 }
    const near = { ...base, ka: 0.18 + 1e-9 }
    const t = 5
    const cExact = concentrationAnalytic(exact, t)
    const cNear = concentrationAnalytic(near, t)
    // limiting form: F*Dose/Vd * ka * t * exp(-ka t)
    const limit = ((base.F * base.dose) / base.Vd) * 0.18 * t * Math.exp(-0.18 * t)
    expect(cExact).toBeCloseTo(limit, 10)
    expect(cNear).toBeCloseTo(limit, 6)
    expect(Number.isFinite(cNear)).toBe(true)
  })

  it('computes Tmax = ln(ka/ke)/(ka-ke) and Tmax = 1/ka at ka = ke', () => {
    const ke = 0.18
    expect(tmaxAnalytic(P)).toBeCloseTo(Math.log(1.2 / ke) / (1.2 - ke), 12)
    const eq: PKParams = { ...P, ka: 0.18, CL: 0.18 * 40 }
    expect(tmaxAnalytic(eq)).toBeCloseTo(1 / 0.18, 10)
  })

  it('Cmax at Tmax is a true maximum of the curve', () => {
    const tmax = tmaxAnalytic(P)
    const cmax = concentrationAnalytic(P, tmax)
    expect(concentrationAnalytic(P, tmax - 0.05)).toBeLessThan(cmax)
    expect(concentrationAnalytic(P, tmax + 0.05)).toBeLessThan(cmax)
  })

  it('AUC(0,inf) equals F*Dose/CL', () => {
    expect(aucAnalytic(P, 0, Infinity)).toBeCloseTo((P.F * P.dose) / P.CL, 10)
  })

  it('AUC(0,24) is less than AUC(0,inf) and matches trapezoid integration', () => {
    const auc24 = aucAnalytic(P, 0, 24)
    expect(auc24).toBeLessThan(aucAnalytic(P, 0, Infinity))
    let trap = 0
    const n = 240000
    const h = 24 / n
    let prev = concentrationAnalytic(P, 0)
    for (let i = 1; i <= n; i++) {
      const c = concentrationAnalytic(P, i * h)
      trap += 0.5 * (prev + c) * h
      prev = c
    }
    expect(auc24).toBeCloseTo(trap, 6)
  })
})

describe('RK4 integration', () => {
  const sim = simulateRK4(P, { tEnd: 24, dt: 0.01 })

  it('starts from the correct initial state', () => {
    expect(sim.t[0]).toBe(0)
    expect(sim.Ag[0]).toBe(P.dose)
    expect(sim.Ac[0]).toBe(0)
    expect(sim.Ae[0]).toBe(0)
    expect(sim.An[0]).toBe(0)
    expect(sim.C[0]).toBe(0)
  })

  it('agrees with the analytic solution to within 1e-6 mg/L', () => {
    let maxErr = 0
    for (let i = 0; i < sim.t.length; i++) {
      const err = Math.abs(sim.C[i] - concentrationAnalytic(P, sim.t[i]))
      if (err > maxErr) maxErr = err
    }
    expect(maxErr).toBeLessThan(1e-6)
  })

  it('conserves total mass Ag + Ac + Ae + An = Dose', () => {
    for (let i = 0; i < sim.t.length; i++) {
      const total = sim.Ag[i] + sim.Ac[i] + sim.Ae[i] + sim.An[i]
      expect(Math.abs(total - P.dose)).toBeLessThan(1e-9)
    }
  })

  it('has monotonically non-decreasing cumulative elimination and non-absorbed mass', () => {
    for (let i = 1; i < sim.t.length; i++) {
      expect(sim.Ae[i]).toBeGreaterThanOrEqual(sim.Ae[i - 1])
      expect(sim.An[i]).toBeGreaterThanOrEqual(sim.An[i - 1])
      expect(sim.Ag[i]).toBeLessThanOrEqual(sim.Ag[i - 1])
    }
  })

  it('partitions absorbed mass by F: An(inf) -> (1-F)*Dose', () => {
    const long = simulateRK4(P, { tEnd: 72, dt: 0.02 })
    const last = long.t.length - 1
    expect(long.An[last]).toBeCloseTo((1 - P.F) * P.dose, 6)
    expect(long.Ag[last]).toBeLessThan(1e-6)
  })

  it('can sample state at an arbitrary time by interpolation', () => {
    const s = sim.stateAt(3.337)
    expect(s.C).toBeCloseTo(concentrationAnalytic(P, 3.337), 5)
    expect(s.Ag + s.Ac + s.Ae + s.An).toBeCloseTo(P.dose, 8)
  })
})

describe('metrics', () => {
  it('reports Cmax, Tmax, AUC0-24, AUC0-inf and half-life consistently', () => {
    const m = computeMetrics(P)
    expect(m.tmax).toBeCloseTo(tmaxAnalytic(P), 12)
    expect(m.cmax).toBeCloseTo(concentrationAnalytic(P, m.tmax), 12)
    expect(m.auc24).toBeCloseTo(aucAnalytic(P, 0, 24), 12)
    expect(m.aucInf).toBeCloseTo((P.F * P.dose) / P.CL, 12)
    expect(m.tHalf).toBeCloseTo(Math.LN2 / 0.18, 12)
    expect(m.ke).toBeCloseTo(0.18, 12)
  })
})

describe('spaceflight scenario mapping', () => {
  it('reference params match the specification defaults', () => {
    expect(REFERENCE_PARAMS).toEqual({ dose: 100, F: 0.85, ka: 1.2, CL: 7.2, Vd: 40 })
    expect(EXAMPLE_SCENARIO).toEqual({ aKa: 0.8, aCL: 0.75, aV: 0.85, aF: 1.0 })
  })

  it('scales parameters multiplicatively', () => {
    const s = applyScenario(P, EXAMPLE_SCENARIO)
    expect(s.ka).toBeCloseTo(0.96, 12)
    expect(s.CL).toBeCloseTo(5.4, 12)
    expect(s.Vd).toBeCloseTo(34, 12)
    expect(s.F).toBeCloseTo(0.85, 12)
    expect(s.dose).toBe(100)
  })

  it('clamps effective F to at most 1', () => {
    const s = applyScenario({ ...P, F: 0.9 }, { ...EXAMPLE_SCENARIO, aF: 1.5 })
    expect(s.F).toBe(1)
  })

  it('clamps user parameters into the supported domain', () => {
    const c = clampParams({ dose: 9999, F: 2, ka: -1, CL: 0, Vd: 0 })
    expect(c.dose).toBe(500)
    expect(c.F).toBe(1)
    expect(c.ka).toBeGreaterThan(0)
    expect(c.CL).toBeGreaterThan(0)
    expect(c.Vd).toBeGreaterThan(0)
  })
})

describe('parameter sensitivities (direction of effect)', () => {
  const m0 = computeMetrics(P)
  it('lower clearance raises AUC0-24 and half-life', () => {
    const m = computeMetrics({ ...P, CL: P.CL * 0.75 })
    expect(m.auc24).toBeGreaterThan(m0.auc24)
    expect(m.tHalf).toBeGreaterThan(m0.tHalf)
  })
  it('smaller Vd raises Cmax', () => {
    const m = computeMetrics({ ...P, Vd: P.Vd * 0.85 })
    expect(m.cmax).toBeGreaterThan(m0.cmax)
  })
  it('slower absorption lowers Cmax and delays Tmax but leaves AUC0-inf unchanged', () => {
    const m = computeMetrics({ ...P, ka: P.ka * 0.8 })
    expect(m.cmax).toBeLessThan(m0.cmax)
    expect(m.tmax).toBeGreaterThan(m0.tmax)
    expect(m.aucInf).toBeCloseTo(m0.aucInf, 12)
  })
  it('AUC0-inf scales linearly with dose and F', () => {
    const m = computeMetrics({ ...P, dose: 200 })
    expect(m.aucInf).toBeCloseTo(2 * m0.aucInf, 12)
    const m2 = computeMetrics({ ...P, F: 0.425 })
    expect(m2.aucInf).toBeCloseTo(0.5 * m0.aucInf, 12)
  })
})
