/**
 * ORBITALRx pharmacokinetic engine.
 *
 * One-compartment model, first-order oral absorption, first-order elimination.
 *
 *   dAg/dt = -ka * Ag                     (GI depot, mg)
 *   dAc/dt =  F * ka * Ag - ke * Ac       (central compartment, mg)
 *   dAe/dt =  ke * Ac                     (cumulative eliminated, mg)
 *   dAn/dt = (1 - F) * ka * Ag            (non-absorbed, mg; closes mass balance)
 *
 *   ke = CL / Vd,   C(t) = Ac(t) / Vd
 *
 * Units: dose mg, ka h^-1, CL L/h, Vd L, F dimensionless, C mg/L, t h.
 */

export interface PKParams {
  dose: number // mg
  F: number // fraction
  ka: number // h^-1
  CL: number // L/h
  Vd: number // L
}

export interface ScenarioMultipliers {
  aKa: number
  aCL: number
  aV: number
  aF: number
}

export const REFERENCE_PARAMS: Readonly<PKParams> = Object.freeze({
  dose: 100,
  F: 0.85,
  ka: 1.2,
  CL: 7.2,
  Vd: 40,
})

/** Hypothetical exploratory scenario. NOT measured spaceflight effect sizes. */
export const EXAMPLE_SCENARIO: Readonly<ScenarioMultipliers> = Object.freeze({
  aKa: 0.8,
  aCL: 0.75,
  aV: 0.85,
  aF: 1.0,
})

export const NEUTRAL_SCENARIO: Readonly<ScenarioMultipliers> = Object.freeze({
  aKa: 1,
  aCL: 1,
  aV: 1,
  aF: 1,
})

export const PARAM_BOUNDS = {
  dose: { min: 25, max: 500 },
  F: { min: 0.1, max: 1 },
  ka: { min: 0.01, max: 20 },
  CL: { min: 0.05, max: 500 },
  Vd: { min: 0.5, max: 2000 },
  aKa: { min: 0.4, max: 1.6 },
  aCL: { min: 0.4, max: 1.6 },
  aV: { min: 0.5, max: 1.5 },
  aF: { min: 0.4, max: 1.6 },
} as const

const clamp = (v: number, min: number, max: number) =>
  Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : min

export function clampParams(p: PKParams): PKParams {
  return {
    dose: clamp(p.dose, PARAM_BOUNDS.dose.min, PARAM_BOUNDS.dose.max),
    F: clamp(p.F, PARAM_BOUNDS.F.min, PARAM_BOUNDS.F.max),
    ka: clamp(p.ka, PARAM_BOUNDS.ka.min, PARAM_BOUNDS.ka.max),
    CL: clamp(p.CL, PARAM_BOUNDS.CL.min, PARAM_BOUNDS.CL.max),
    Vd: clamp(p.Vd, PARAM_BOUNDS.Vd.min, PARAM_BOUNDS.Vd.max),
  }
}

export function clampScenario(s: ScenarioMultipliers): ScenarioMultipliers {
  return {
    aKa: clamp(s.aKa, PARAM_BOUNDS.aKa.min, PARAM_BOUNDS.aKa.max),
    aCL: clamp(s.aCL, PARAM_BOUNDS.aCL.min, PARAM_BOUNDS.aCL.max),
    aV: clamp(s.aV, PARAM_BOUNDS.aV.min, PARAM_BOUNDS.aV.max),
    aF: clamp(s.aF, PARAM_BOUNDS.aF.min, PARAM_BOUNDS.aF.max),
  }
}

/** Spaceflight scenario = Earth parameters scaled by multipliers; effective F clamped to <= 1. */
export function applyScenario(earth: PKParams, s: ScenarioMultipliers): PKParams {
  return {
    dose: earth.dose,
    F: Math.min(1, earth.F * s.aF),
    ka: earth.ka * s.aKa,
    CL: earth.CL * s.aCL,
    Vd: earth.Vd * s.aV,
  }
}

export function derived(p: PKParams) {
  const ke = p.CL / p.Vd
  return { ke, tHalf: Math.LN2 / ke }
}

/** Relative tolerance under which ka and ke are treated as equal (switch to limiting form). */
const EQ_TOL = 1e-7

function nearlyEqualRates(ka: number, ke: number) {
  return Math.abs(ka - ke) <= EQ_TOL * Math.max(ka, ke)
}

/** Closed-form plasma concentration C(t) in mg/L. */
export function concentrationAnalytic(p: PKParams, t: number): number {
  if (t <= 0) return 0
  const ke = p.CL / p.Vd
  const { ka, F, dose, Vd } = p
  if (nearlyEqualRates(ka, ke)) {
    return ((F * dose) / Vd) * ka * t * Math.exp(-ka * t)
  }
  return ((F * dose * ka) / (Vd * (ka - ke))) * (Math.exp(-ke * t) - Math.exp(-ka * t))
}

/** Analytic time of peak concentration, h. */
export function tmaxAnalytic(p: PKParams): number {
  const ke = p.CL / p.Vd
  if (nearlyEqualRates(p.ka, ke)) return 1 / p.ka
  return Math.log(p.ka / ke) / (p.ka - ke)
}

/**
 * Exact integral of C(t) from t0 to t1 (mg·h/L). t1 may be Infinity.
 * ∫ C dt = (F·D·ka)/(Vd(ka−ke)) · [ (e^{−ke t0} − e^{−ke t1})/ke − (e^{−ka t0} − e^{−ka t1})/ka ]
 * At ka = ke: ∫ a·k·t·e^{−kt} dt = a · [ (1 + k t0) e^{−k t0} − (1 + k t1) e^{−k t1} ] / k
 */
export function aucAnalytic(p: PKParams, t0: number, t1: number): number {
  const ke = p.CL / p.Vd
  const { ka, F, dose, Vd } = p
  const e = (k: number, t: number) => (t === Infinity ? 0 : Math.exp(-k * t))
  if (nearlyEqualRates(ka, ke)) {
    const a = (F * dose) / Vd
    const term = (t: number) => (t === Infinity ? 0 : (1 + ka * t) * Math.exp(-ka * t))
    return (a * (term(t0) - term(t1))) / ka
  }
  const pref = (F * dose * ka) / (Vd * (ka - ke))
  return pref * ((e(ke, t0) - e(ke, t1)) / ke - (e(ka, t0) - e(ka, t1)) / ka)
}

export interface PKMetrics {
  ke: number
  tHalf: number
  tmax: number
  cmax: number
  auc24: number
  aucInf: number
}

export function computeMetrics(p: PKParams): PKMetrics {
  const { ke, tHalf } = derived(p)
  const tmax = tmaxAnalytic(p)
  return {
    ke,
    tHalf,
    tmax,
    cmax: concentrationAnalytic(p, tmax),
    auc24: aucAnalytic(p, 0, 24),
    aucInf: (p.F * p.dose) / p.CL,
  }
}

// ---------------------------------------------------------------------------
// Numerical integration (RK4) for the four-state mass-balance system
// ---------------------------------------------------------------------------

export interface SimState {
  t: number
  Ag: number
  Ac: number
  Ae: number
  An: number
  C: number
}

export interface Simulation {
  t: Float64Array
  Ag: Float64Array
  Ac: Float64Array
  Ae: Float64Array
  An: Float64Array
  C: Float64Array
  params: PKParams
  /** Linear interpolation of the stored trajectory at arbitrary time. */
  stateAt(t: number): SimState
}

export interface SimOptions {
  tEnd?: number
  dt?: number
}

type Vec4 = [number, number, number, number]

export function simulateRK4(p: PKParams, opts: SimOptions = {}): Simulation {
  const tEnd = opts.tEnd ?? 24
  const dt = opts.dt ?? 0.01
  const ke = p.CL / p.Vd
  const { ka, F } = p
  const n = Math.max(1, Math.round(tEnd / dt))
  const h = tEnd / n

  const f = (y: Vec4): Vec4 => {
    const [Ag, Ac] = y
    const absorb = ka * Ag
    return [-absorb, F * absorb - ke * Ac, ke * Ac, (1 - F) * absorb]
  }

  const t = new Float64Array(n + 1)
  const Ag = new Float64Array(n + 1)
  const Ac = new Float64Array(n + 1)
  const Ae = new Float64Array(n + 1)
  const An = new Float64Array(n + 1)
  const C = new Float64Array(n + 1)

  let y: Vec4 = [p.dose, 0, 0, 0]
  const store = (i: number) => {
    t[i] = i * h
    Ag[i] = y[0]
    Ac[i] = y[1]
    Ae[i] = y[2]
    An[i] = y[3]
    C[i] = y[1] / p.Vd
  }
  store(0)

  for (let i = 1; i <= n; i++) {
    const k1 = f(y)
    const k2 = f([y[0] + 0.5 * h * k1[0], y[1] + 0.5 * h * k1[1], y[2] + 0.5 * h * k1[2], y[3] + 0.5 * h * k1[3]])
    const k3 = f([y[0] + 0.5 * h * k2[0], y[1] + 0.5 * h * k2[1], y[2] + 0.5 * h * k2[2], y[3] + 0.5 * h * k2[3]])
    const k4 = f([y[0] + h * k3[0], y[1] + h * k3[1], y[2] + h * k3[2], y[3] + h * k3[3]])
    y = [
      y[0] + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
      y[1] + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
      y[2] + (h / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]),
      y[3] + (h / 6) * (k1[3] + 2 * k2[3] + 2 * k3[3] + k4[3]),
    ]
    // Guard against tiny negative values from floating-point rounding.
    if (y[0] < 0 && y[0] > -1e-12) y[0] = 0
    store(i)
  }

  const stateAt = (tq: number): SimState => {
    const tc = Math.min(tEnd, Math.max(0, tq))
    const x = tc / h
    const i0 = Math.min(n - 1, Math.floor(x))
    const w = x - i0
    const lerp = (a: Float64Array) => a[i0] + w * (a[i0 + 1] - a[i0])
    return { t: tc, Ag: lerp(Ag), Ac: lerp(Ac), Ae: lerp(Ae), An: lerp(An), C: lerp(C) }
  }

  return { t, Ag, Ac, Ae, An, C, params: p, stateAt }
}

/** Sample the analytic curve on a uniform grid (for plotting). */
export function sampleCurve(p: PKParams, tEnd = 24, n = 481): { t: Float64Array; C: Float64Array } {
  const t = new Float64Array(n)
  const C = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    t[i] = (i * tEnd) / (n - 1)
    C[i] = concentrationAnalytic(p, t[i])
  }
  return { t, C }
}

export function pctDiff(space: number, earth: number): number {
  if (earth === 0) return 0
  return ((space - earth) / earth) * 100
}
