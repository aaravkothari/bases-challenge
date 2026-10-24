import { describe, it, expect } from 'vitest'
import { mulberry32, sampleDistribution, quantile } from './random'

describe('seeded PRNG', () => {
  it('is reproducible for the same seed', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    const xs = Array.from({ length: 5 }, () => a())
    const ys = Array.from({ length: 5 }, () => b())
    expect(xs).toEqual(ys)
  })
  it('produces values in [0,1)', () => {
    const r = mulberry32(7)
    for (let i = 0; i < 1000; i++) {
      const v = r()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('sampleDistribution', () => {
  it('uniform samples stay within bounds', () => {
    const r = mulberry32(1)
    for (let i = 0; i < 500; i++) {
      const v = sampleDistribution({ kind: 'uniform', min: 0.6, max: 1.0 }, r)
      expect(v).toBeGreaterThanOrEqual(0.6)
      expect(v).toBeLessThanOrEqual(1.0)
    }
  })
  it('triangular samples stay within bounds and cluster near the mode', () => {
    const r = mulberry32(3)
    let sum = 0
    const n = 4000
    for (let i = 0; i < n; i++) {
      const v = sampleDistribution({ kind: 'triangular', min: 0.5, mode: 0.8, max: 1.1 }, r)
      expect(v).toBeGreaterThanOrEqual(0.5)
      expect(v).toBeLessThanOrEqual(1.1)
      sum += v
    }
    expect(sum / n).toBeCloseTo(0.8, 1)
  })
  it('lognormal samples are positive with median near the specified median', () => {
    const r = mulberry32(9)
    const xs: number[] = []
    for (let i = 0; i < 4000; i++) {
      const v = sampleDistribution({ kind: 'lognormal', median: 0.75, cv: 0.2 }, r)
      expect(v).toBeGreaterThan(0)
      xs.push(v)
    }
    expect(quantile(xs, 0.5)).toBeCloseTo(0.75, 1)
  })
})

describe('quantile', () => {
  it('returns interpolated quantiles of an unsorted array', () => {
    expect(quantile([5, 1, 3, 2, 4], 0.5)).toBe(3)
    expect(quantile([1, 2, 3, 4], 0.5)).toBeCloseTo(2.5)
    expect(quantile([1, 2, 3, 4], 0)).toBe(1)
    expect(quantile([1, 2, 3, 4], 1)).toBe(4)
  })
})
