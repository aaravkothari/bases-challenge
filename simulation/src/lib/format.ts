export function fmt(v: number, digits = 3): string {
  if (!Number.isFinite(v)) return '—'
  if (v === 0) return '0'
  const abs = Math.abs(v)
  if (abs >= 1000) return v.toFixed(0)
  if (abs >= 100) return v.toFixed(Math.max(0, digits - 3))
  if (abs >= 10) return v.toFixed(Math.max(0, digits - 2))
  if (abs >= 1) return v.toFixed(Math.max(0, digits - 1))
  return v.toPrecision(digits)
}

export function fmtPct(v: number, digits = 1): string {
  if (!Number.isFinite(v)) return '—'
  const s = v.toFixed(digits)
  return (v > 0 ? '+' : '') + s + '%'
}

export function fmtTime(h: number): string {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  if (mm === 60) return `${String(hh + 1).padStart(2, '0')}:00`
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

export function fmtMult(v: number): string {
  return v.toFixed(2) + '×'
}
