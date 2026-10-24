import { useMemo } from 'react'
import katex from 'katex'

export function Tex({ tex, display = false, className = '' }: { tex: string; display?: boolean; className?: string }) {
  const html = useMemo(
    () => katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: 'ignore' }),
    [tex, display],
  )
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
