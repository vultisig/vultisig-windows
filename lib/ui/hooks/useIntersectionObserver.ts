import { RefObject, useEffect, useRef } from 'react'

type UseIOOptions = {
  rootRef?: RefObject<Element | null>
  threshold?: number | number[]
  rootMargin?: string
  onIntersect: (
    entry: IntersectionObserverEntry,
    observer: IntersectionObserver
  ) => void
}

export function useIntersectionObserver<
  T extends HTMLElement = HTMLDivElement,
>({ rootRef, threshold = 0, onIntersect }: UseIOOptions): RefObject<T> {
  const targetRef = useRef<T>(null)

  const handlerRef = useRef(onIntersect)
  useEffect(() => {
    handlerRef.current = onIntersect
  }, [onIntersect])

  useEffect(() => {
    const root = rootRef?.current ?? null
    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      entries => {
        const e = entries[0]
        if (e?.isIntersecting) handlerRef.current(e, observer)
      },
      { root, threshold }
    )

    observer.observe(target)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, rootRef?.current])

  return targetRef as RefObject<T>
}
