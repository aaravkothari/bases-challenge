import { useId } from 'react'

interface Props {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  format: (v: number) => string
  note?: string
  tone?: 'space' | 'earth' | 'amber'
}

const COLOR = { space: 'var(--color-space)', earth: 'var(--color-earth)', amber: 'var(--color-amber)' }

export function Slider({ label, value, min, max, step, onChange, format, note, tone = 'space' }: Props) {
  const id = useId()
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-[13px]">
        <label htmlFor={id} className="text-ink-2">{label}{note && <span className="small ml-2">{note}</span>}</label>
        <span className="mono text-ink">{format(value)}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        style={{ ['--pct' as string]: `${pct}%`, ['--fill' as string]: COLOR[tone] }} aria-valuetext={format(value)} />
    </div>
  )
}
