import { useCallback, useLayoutEffect, useRef } from 'react'

type Props = {
  chain: string
}

export const useScrollSelectedChainIntoView = ({ chain }: Props) => {
  const footerRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const prevChain = useRef<string | undefined>(undefined)

  const computeCenteredLeft = (
    container: HTMLDivElement,
    el: HTMLDivElement
  ) => {
    const cRect = container.getBoundingClientRect()
    const eRect = el.getBoundingClientRect()
    const delta =
      eRect.left - cRect.left - (container.clientWidth - eRect.width) / 2
    let left = container.scrollLeft + delta
    const maxLeft = container.scrollWidth - container.clientWidth
    if (left < 0) left = 0
    if (left > maxLeft) left = maxLeft
    return left
  }

  const scrollChainIntoView = useCallback(
    (key: string, behavior: ScrollBehavior = 'auto') => {
      const container = footerRef.current
      const el = itemRefs.current[key]
      if (!container || !el) return

      const cLeft = container.scrollLeft
      const cRight = cLeft + container.clientWidth
      const eLeft = el.offsetLeft
      const eRight = eLeft + el.offsetWidth
      if (eLeft >= cLeft && eRight <= cRight) return

      const left = computeCenteredLeft(container, el)
      container.scrollTo({ left, behavior })
    },
    []
  )

  useLayoutEffect(() => {
    if (!chain) return

    const id = requestAnimationFrame(() => {
      const behavior: ScrollBehavior =
        prevChain.current && prevChain.current !== chain ? 'smooth' : 'auto'
      scrollChainIntoView(chain, behavior)
      prevChain.current = chain
    })
    return () => cancelAnimationFrame(id)
  }, [chain, scrollChainIntoView])

  return {
    footerRef,
    itemRefs,
    scrollChainIntoView,
  }
}
