import { RefObject, useEffect, useState } from 'react'

type UseIntersectionParams = Pick<
  IntersectionObserverInit,
  'root' | 'rootMargin' | 'threshold'
>

export const useIntersection = (
  ref: RefObject<HTMLElement | null>,
  { root, rootMargin, threshold }: UseIntersectionParams
): IntersectionObserverEntry | null => {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver !== 'function') return

    const observer = new IntersectionObserver(entries => setEntry(entries[0]), {
      root: root ?? null,
      rootMargin,
      threshold,
    })

    observer.observe(node)
    return () => {
      setEntry(null)
      observer.disconnect()
    }
  }, [ref, root, rootMargin, threshold])

  return entry
}
