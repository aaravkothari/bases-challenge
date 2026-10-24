import { useState } from 'react'
import { AnatomyView } from './components/AnatomyView'
import { ConcentrationChart } from './components/ConcentrationChart'
import { Slider } from './components/Slider'
import { Tex } from './components/Katex'
import { fmtTime } from './lib/format'
import { EXAMPLE_SCENARIO, pctDiff } from './model/pk'
import { T_END, useSimulation } from './hooks/useSimulation'

function phrase(d: number, more: string, less: string) {
  const n = Math.round(Math.abs(d))
  if (n < 1) return { num: 'same', text: 'as Earth' }
  return { num: `${n}%`, text: d > 0 ? more : less }
}

/** Simulation widget. */
export function OrbitalRxWidget() {
  const sim = useSimulation()
  const { earth, space, scenario, metrics, time } = sim
  const [strength, setStrength] = useState(1)
  const aFMax = Math.min(1.6, 1 / earth.F)

  const setStrengthAll = (s: number) => {
    setStrength(s)
    sim.setScenario({
      aKa: 1 + s * (EXAMPLE_SCENARIO.aKa - 1),
      aCL: 1 + s * (EXAMPLE_SCENARIO.aCL - 1),
      aV: 1 + s * (EXAMPLE_SCENARIO.aV - 1),
      aF: 1 + s * (EXAMPLE_SCENARIO.aF - 1),
    })
  }

  const peak = phrase(pctDiff(metrics.space.cmax, metrics.earth.cmax), 'higher peak blood level', 'lower peak blood level')
  const auc = phrase(pctDiff(metrics.space.auc24, metrics.earth.auc24), 'more total exposure over 24 h', 'less total exposure over 24 h')
  const half = phrase(pctDiff(metrics.space.tHalf, metrics.earth.tHalf), 'longer half-life', 'shorter half-life')

  return (
    <div className="max-w-[960px]">
      <p className="text-[15px] text-ink">In space the gut slows down, body fluid shifts, and the liver and kidneys clear drugs differently. The same oral dose gives a different blood level.</p>

      <div className="flex items-center gap-2 mt-3 mb-3">
        <button className="plain" aria-pressed={sim.condition === 'earth'} onClick={() => sim.setCondition('earth')}>On Earth</button>
        <button className="plain" aria-pressed={sim.condition === 'space'} onClick={() => sim.setCondition('space')}>In space</button>
        <button className="plain ml-3" onClick={() => sim.setPlaying(!sim.playing)}>{sim.playing ? 'pause' : 'play'}</button>
        <span className="mono text-[13px] text-ink-2 ml-1">{fmtTime(time)} h after the dose</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[300px_minmax(0,1fr)] gap-6 items-start">
        <AnatomyView sims={sim.sims} condition={sim.condition} time={time} />
        <div>
          <ConcentrationChart earth={earth} space={space} curves={sim.curves} metrics={metrics} envelope={null} time={time} onScrub={sim.setTime} height={240} />
          <input type="range" min={0} max={T_END} step={0.01} value={time} onChange={(e) => sim.setTime(Number(e.target.value))} aria-label="hours after the dose"
            className="mt-1" style={{ ['--pct' as string]: `${(time / T_END) * 100}%`, ['--fill' as string]: 'var(--color-ink-2)' }} />

          <div className="grid grid-cols-3 gap-4 mt-4">
            {[peak, auc, half].map((p, i) => (
              <div key={i}>
                <div className="mono text-[26px] leading-none text-space">{p.num}</div>
                <div className="text-[13px] text-ink-2 mt-1.5">{p.text}</div>
              </div>
            ))}
          </div>
          <div className="small mt-3">Space vs Earth for this drug.</div>
        </div>
      </div>

      <div className="max-w-[480px] mt-5">
        <Slider label="Spaceflight effect" note="0 = Earth" value={strength} min={0} max={1.5} step={0.05} onChange={setStrengthAll} format={(v) => (v === 0 ? 'none' : v === 1 ? 'typical' : `${v.toFixed(2)}× typical`)} />
        <p className="small mt-1">Typical values move each parameter in the direction the physiology suggests based on our group's lit review. The sizes are illustrative. Click fine tune to set each one.</p>
      </div>

      <details className="mt-3 small">
        <summary className="cursor-pointer">fine tune</summary>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 mt-3">
          <Slider label="gut absorbs" note="speed" value={scenario.aKa} min={0.4} max={1.6} step={0.01} onChange={(v) => sim.setScenario({ aKa: v })} format={(v) => `${v.toFixed(2)}×`} />
          <Slider label="liver and kidneys clear" note="speed" value={scenario.aCL} min={0.4} max={1.6} step={0.01} onChange={(v) => sim.setScenario({ aCL: v })} format={(v) => `${v.toFixed(2)}×`} />
          <Slider label="fluid it spreads into" note="volume" value={scenario.aV} min={0.5} max={1.5} step={0.01} onChange={(v) => sim.setScenario({ aV: v })} format={(v) => `${v.toFixed(2)}×`} />
          <Slider label="amount absorbed" note="fraction" value={Math.min(scenario.aF, aFMax)} min={0.4} max={aFMax} step={0.01} onChange={(v) => sim.setScenario({ aF: v })} format={(v) => `${v.toFixed(2)}×`} />
        </div>
        <p className="mt-2">Each is a multiple of the Earth value. Typical values in space: 0.80, 0.75, 0.85, 1.00.</p>
      </details>

      <details className="mt-2 small">
        <summary className="cursor-pointer">the model</summary>
        <div className="mt-2 text-ink-2 max-w-[640px]">
          <p>The drug passes through three stages: in the gut, in the blood, cleared. Each stage is one equation.</p>
          <p><strong>1. The gut empties into the blood.</strong> A fixed fraction of what is left in the gut moves out each hour. That fraction is <Tex tex="k_a" />.</p>
          <Tex display tex={String.raw`\frac{dA_{gut}}{dt} = -k_a\, A_{gut}`} />
          <p><strong>2. The blood gains and loses.</strong> It gains what the gut releases, times the fraction <Tex tex="F" /> that actually makes it through. It loses what the liver and kidneys remove, a fraction <Tex tex="k_e" /> of the blood amount each hour.</p>
          <Tex display tex={String.raw`\frac{dA_{blood}}{dt} = F\, k_a\, A_{gut} - k_e\, A_{blood}`} />
          <p><strong>3. Amount becomes a level.</strong> Blood level is the amount in the blood divided by the volume it is spread over, <Tex tex="V_d" />. The removal fraction <Tex tex="k_e" /> is the clearance <Tex tex="CL" /> (litres cleaned per hour) divided by that same volume.</p>
          <Tex display tex={String.raw`C = \frac{A_{blood}}{V_d} \qquad k_e = \frac{CL}{V_d}`} />
          <p>Solving the two equations gives the curve on the chart. It rises as the gut empties and falls as clearance takes over.</p>
          <Tex display tex={String.raw`C(t) = \frac{F \cdot \text{dose} \cdot k_a}{V_d\,(k_a - k_e)}\left(e^{-k_e t} - e^{-k_a t}\right)`} />
          <p>The three numbers above come from that curve: the peak is its highest point, total exposure is the area under it, and half-life is <Tex tex="\ln 2 / k_e" />, the time for the level to halve once the gut is empty.</p>
          <p><strong>Space.</strong> The sliders multiply <Tex tex="k_a" />, <Tex tex="CL" />, <Tex tex="V_d" /> and <Tex tex="F" /> by the chosen factors. Nothing else in the equations changes.</p>
          <p>The drug in the demo is hypothetical: 100 mg dose, F 0.85, <Tex tex="k_a" /> 1.2 per hour, CL 7.2 L/h, <Tex tex="V_d" /> 40 L. Physiology sources: NASA OCHMO TB-006 (2023); Dello Russo et al., Br J Pharmacol 2022; Blue et al., npj Microgravity 2019.</p>
        </div>
      </details>
    </div>
  )
}
