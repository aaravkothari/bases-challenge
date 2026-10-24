/** Mulberry32: small, fast, seedable 32-bit PRNG. Deterministic for a given seed. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Distribution =
  | { kind: 'uniform'; min: number; max: number }
  | { kind: 'triangular'; min: number; mode: number; max: number }
  | { kind: 'lognormal'; median: number; cv: number }
  | { kind: 'fixed'; value: number }

/** Box–Muller standard normal from a uniform source. */
function standardNormal(rng: () => number): number {
  let u = 0
  while (u === 0) u = rng()
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function sampleDistribution(d: Distribution, rng: () => number): number {
  switch (d.kind) {
    case 'fixed':
      return d.value
    case 'uniform':
      return d.min + (d.max - d.min) * rng()
    case 'triangular': {
      const u = rng()
      const { min, mode, max } = d
      const fc = (mode - min) / (max - min)
      return u < fc
        ? min + Math.sqrt(u * (max - min) * (mode - min))
        : max - Math.sqrt((1 - u) * (max - min) * (max - mode))
    }
    case 'lognormal': {
      // sigma from coefficient of variation: cv^2 = exp(sigma^2) - 1
      const sigma = Math.sqrt(Math.log(1 + d.cv * d.cv))
      return d.median * Math.exp(sigma * standardNormal(rng))
    }
  }
}

/** Linear-interpolated quantile (R type 7). Does not mutate input. */
export function quantile(values: ArrayLike<number>, q: number): number {
  const s = Array.from(values).sort((a, b) => a - b)
  if (s.length === 0) return NaN
  const pos = (s.length - 1) * q
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  if (lo === hi) return s[lo]
  return s[lo] + (s[hi] - s[lo]) * (pos - lo)
}
