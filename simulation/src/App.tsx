import { OrbitalRxWidget } from './Widget'

const embedded = new URLSearchParams(location.search).has('embed')

export default function App() {
  return (
    <div className={embedded ? 'px-6 py-6 sm:px-8' : 'mx-auto max-w-[960px] px-6 py-10'}>
      {!embedded && <h1>ORBITALRx</h1>}
      <OrbitalRxWidget />
    </div>
  )
}
