import { useEffect, useState } from 'react'

type Params = {
  target: Element | null
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
}

export function useIntersection({
  target,
  root = null,
  rootMargin = '0px',
  threshold = 0,
}: Params): IntersectionObserverEntry | null {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)

  useEffect(() => {
    if (!target || typeof IntersectionObserver !== 'function') return
    const obs = new IntersectionObserver(([e]) => setEntry(e), {
      root,
      rootMargin,
      threshold,
    })
    obs.observe(target)
    return () => obs.disconnect()
  }, [target, root, rootMargin, threshold])

  return entry
}
