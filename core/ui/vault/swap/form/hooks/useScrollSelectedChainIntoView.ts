import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'

type Props = {
  chain: string
  onSelect?: (key: string) => void // called when scroll settles on a different chain
}

export const useCenteredSnapCarousel = ({ chain, onSelect }: Props) => {
  const footerRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const prevChain = useRef<string | undefined>(undefined)
  const strokeRef = useRef<HTMLDivElement | null>(null)

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

  const scrollToKey = useCallback(
    (key: string, behavior: ScrollBehavior = 'auto') => {
      const container = footerRef.current
      const el = itemRefs.current[key]
      if (!container || !el) return
      const left = computeCenteredLeft(container, el)
      if (Math.abs(container.scrollLeft - left) > 1) {
        container.scrollTo({ left, behavior })
      }
    },
    []
  )

  const selectNearest = useCallback(() => {
    const container = footerRef.current
    if (!container) return
    const target = strokeRef.current ?? container
    const tRect = target.getBoundingClientRect()
    const centerX = tRect.left + tRect.width / 2

    let bestKey: string | null = null
    let bestDist = Infinity

    for (const [key, el] of Object.entries(itemRefs.current)) {
      if (!el) continue
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const d = Math.abs(cx - centerX)
      if (d < bestDist) {
        bestDist = d
        bestKey = key
      }
    }

    if (bestKey && bestKey !== chain) {
      onSelect?.(bestKey)
      // snap precisely (CSS snap will usually do this; this is a safe nudge)
      scrollToKey(bestKey, 'smooth')
    }
  }, [chain, onSelect, scrollToKey])

  // Keep selected chain centered when prop changes
  useLayoutEffect(() => {
    if (!chain) return
    const id = requestAnimationFrame(() => {
      const behavior: ScrollBehavior =
        prevChain.current && prevChain.current !== chain ? 'smooth' : 'auto'
      scrollToKey(chain, behavior)
      prevChain.current = chain
    })
    return () => cancelAnimationFrame(id)
  }, [chain, scrollToKey])

  // Detect scroll end → pick nearest chip
  useEffect(() => {
    const el = footerRef.current
    if (!el) return

    let t: number | null = null
    const onScroll = () => {
      if (t) window.clearTimeout(t)
      t = window.setTimeout(selectNearest, 120) // fallback if 'scrollend' isn’t supported
    }

    const onScrollEnd = () => {
      if (t) window.clearTimeout(t)
      selectNearest()
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    // @ts-ignore: 'scrollend' is widely supported; ignore TS typing
    el.addEventListener('scrollend', onScrollEnd)

    return () => {
      el.removeEventListener('scroll', onScroll)
      // @ts-ignore
      el.removeEventListener('scrollend', onScrollEnd)
      if (t) window.clearTimeout(t)
    }
  }, [selectNearest])

  return { footerRef, itemRefs, scrollToKey, strokeRef }
}
