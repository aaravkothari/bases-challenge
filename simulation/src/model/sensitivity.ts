import { computeMetrics, concentrationAnalytic, type PKParams, type PKMetrics } from './pk'
import { mulberry32, sampleDistribution, quantile, type Distribution } from './random'

export type SensParam = 'ka' | 'CL' | 'Vd' | 'F'
export const SENS_PARAMS: SensParam[] = ['ka', 'CL', 'Vd', 'F']

/** Multiplier ranges [low, high] applied to each parameter one at a time. */
export type TornadoRanges = Record<SensParam, [number, number]>

export interface TornadoRow {
  param: SensParam
  lowMult: number
  highMult: number
  base: PKMetrics
  low: PKMetrics
  high: PKMetrics
}

function scaled(p: PKParams, param: SensParam, mult: number): PKParams {
  const q = { ...p }
  q[param] = p[param] * mult
  if (param === 'F') q.F = Math.min(1, q.F)
  return q
}

/** One-at-a-time sensitivity: vary each parameter by its multiplier range while holding others fixed. */
export function tornado(base: PKParams, ranges: TornadoRanges): TornadoRow[] {
  const baseM = computeMetrics(base)
  return SENS_PARAMS.map((param) => {
    const [lo, hi] = ranges[param]
    return {
      param,
      lowMult: lo,
      highMult: hi,
      base: baseM,
      low: computeMetrics(scaled(base, param, lo)),
      high: computeMetrics(scaled(base, param, hi)),
    }
  })
}

export interface MCConfig {
  n: number
  seed: number
  ka: Distribution
  CL: Distribution
  Vd: Distribution
  F: Distribution
  tEnd?: number
  nGrid?: number
}

/** Illustrative default spread around the example scenario. NOT literature-derived. */
export const DEFAULT_MC_CONFIG: MCConfig = {
  n: 500,
  seed: 20240611,
  ka: { kind: 'lognormal', median: 0.8, cv: 0.25 },
  CL: { kind: 'lognormal', median: 0.75, cv: 0.25 },
  Vd: { kind: 'lognormal', median: 0.85, cv: 0.15 },
  F: { kind: 'triangular', min: 0.85, mode: 1.0, max: 1.1 },
}

export interface Summary {
  p05: number
  p25: number
  p50: number
  p75: number
  p95: number
  mean: number
}

export interface MCResult {
  samples: PKParams[]
  multipliers: { ka: Float64Array; CL: Float64Array; Vd: Float64Array; F: Float64Array }
  cmax: Float64Array
  auc24: Float64Array
  tmax: Float64Array
  tHalf: Float64Array
  envelope: { t: Float64Array; p05: Float64Array; p50: Float64Array; p95: Float64Array }
  stats: { cmax: Summary; auc24: Summary; tmax: Summary; tHalf: Summary }
}

function summarize(xs: Float64Array): Summary {
  let mean = 0
  for (const v of xs) mean += v
  mean /= xs.length
  return {
    p05: quantile(xs, 0.05),
    p25: quantile(xs, 0.25),
    p50: quantile(xs, 0.5),
    p75: quantile(xs, 0.75),
    p95: quantile(xs, 0.95),
    mean,
  }
}

/**
 * Monte Carlo propagation of hypothetical scenario-multiplier uncertainty.
 * Samples multipliers from the configured distributions, applies them to the Earth
 * reference parameters, and evaluates the analytic PK solution on a time grid.
 */
export function monteCarlo(earth: PKParams, cfg: MCConfig): MCResult {
  const n = Math.max(1, Math.floor(cfg.n))
  const tEnd = cfg.tEnd ?? 24
  const nGrid = cfg.nGrid ?? 97
  const rng = mulberry32(cfg.seed)

  const samples: PKParams[] = new Array(n)
  const mKa = new Float64Array(n)
  const mCL = new Float64Array(n)
  const mVd = new Float64Array(n)
  const mF = new Float64Array(n)
  const cmax = new Float64Array(n)
  const auc24 = new Float64Array(n)
  const tmax = new Float64Array(n)
  const tHalf = new Float64Array(n)

  const t = new Float64Array(nGrid)
  for (let j = 0; j < nGrid; j++) t[j] = (j * tEnd) / (nGrid - 1)
  // concentration matrix stored column-wise per time index for quantiles
  const grid: Float64Array[] = Array.from({ length: nGrid }, () => new Float64Array(n))

  for (let i = 0; i < n; i++) {
    mKa[i] = sampleDistribution(cfg.ka, rng)
    mCL[i] = sampleDistribution(cfg.CL, rng)
    mVd[i] = sampleDistribution(cfg.Vd, rng)
    mF[i] = sampleDistribution(cfg.F, rng)
    const p: PKParams = {
      dose: earth.dose,
      F: Math.min(1, earth.F * mF[i]),
      ka: Math.max(1e-6, earth.ka * mKa[i]),
      CL: Math.max(1e-6, earth.CL * mCL[i]),
      Vd: Math.max(1e-6, earth.Vd * mVd[i]),
    }
    samples[i] = p
    const m = computeMetrics(p)
    cmax[i] = m.cmax
    auc24[i] = m.auc24
    tmax[i] = m.tmax
    tHalf[i] = m.tHalf
    for (let j = 0; j < nGrid; j++) grid[j][i] = concentrationAnalytic(p, t[j])
  }

  const p05 = new Float64Array(nGrid)
  const p50 = new Float64Array(nGrid)
  const p95 = new Float64Array(nGrid)
  for (let j = 0; j < nGrid; j++) {
    const col = grid[j]
    p05[j] = quantile(col, 0.05)
    p50[j] = quantile(col, 0.5)
    p95[j] = quantile(col, 0.95)
  }

  return {
    samples,
    multipliers: { ka: mKa, CL: mCL, Vd: mVd, F: mF },
    cmax,
    auc24,
    tmax,
    tHalf,
    envelope: { t, p05, p50, p95 },
    stats: { cmax: summarize(cmax), auc24: summarize(auc24), tmax: summarize(tmax), tHalf: summarize(tHalf) },
  }
}
