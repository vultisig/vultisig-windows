import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'

type Props = {
  chain: string
  onSelect?: (key: string) => void
}

const scrollStillFrames = 8
const velocityEpsilon = 0.5
const strokeExtra = 12
const minStroke = 44

export const useCenteredSnapCarousel = ({ chain, onSelect }: Props) => {
  const footerRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const prevChain = useRef<string | undefined>(undefined)
  const strokeRef = useRef<HTMLDivElement | null>(null)

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return (
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
    )
  }, [])

  const getBehavior = useCallback(
    (): ScrollBehavior => (prefersReducedMotion ? 'auto' : 'smooth'),
    [prefersReducedMotion]
  )

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
    (key: string, behavior?: ScrollBehavior) => {
      const container = footerRef.current
      const el = itemRefs.current[key]
      if (!container || !el) return
      const left = computeCenteredLeft(container, el)
      if (Math.abs(container.scrollLeft - left) > 1) {
        container.scrollTo({ left, behavior: behavior ?? getBehavior() })
      }
    },
    [getBehavior]
  )

  const setStrokeToKey = useCallback(
    (key?: string) => {
      const container = footerRef.current
      const stroke = strokeRef.current
      if (!container || !stroke) return

      const el =
        (key ? itemRefs.current[key] : null) ??
        (chain ? itemRefs.current[chain] : null)
      if (!el) return

      const r = el.getBoundingClientRect()
      const width = Math.max(minStroke, Math.ceil(r.width + strokeExtra))

      stroke.style.width = `${width}px`
    },
    [chain]
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
    }
    if (bestKey) {
      setStrokeToKey(bestKey)
      scrollToKey(bestKey)
    } else {
      setStrokeToKey(chain)
      scrollToKey(chain)
    }
  }, [chain, onSelect, scrollToKey, setStrokeToKey])

  useLayoutEffect(() => {
    if (!chain) return
    const id = requestAnimationFrame(() => {
      const behavior: ScrollBehavior =
        prevChain.current && prevChain.current !== chain
          ? getBehavior()
          : 'auto'
      scrollToKey(chain, behavior)
      setStrokeToKey(chain)
      prevChain.current = chain
    })
    return () => cancelAnimationFrame(id)
  }, [chain, scrollToKey, setStrokeToKey, getBehavior])

  useEffect(() => {
    const el = footerRef.current
    if (!el) return

    let raf = 0
    let running = false
    let last = el.scrollLeft
    let still = 0

    const stop = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      running = false
    }

    const tick = () => {
      const now = el.scrollLeft
      const delta = Math.abs(now - last)
      last = now

      if (delta < velocityEpsilon) {
        still++
        if (still >= scrollStillFrames) {
          still = 0
          selectNearest()
          stop()
          return
        }
      } else {
        still = 0
      }
      raf = requestAnimationFrame(tick)
    }

    const start = () => {
      if (running) return
      running = true
      last = el.scrollLeft
      still = 0
      raf = requestAnimationFrame(tick)
    }

    const onScroll = () => start()
    el.addEventListener('scroll', onScroll, { passive: true })

    const onVisibility = () => {
      if (document.hidden) stop()
    }

    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      el.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      stop()
    }
  }, [selectNearest])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      e.preventDefault()
      const keys = Object.keys(itemRefs.current)
      const idx = keys.findIndex(k => k === chain)
      if (idx < 0) return
      const nextIdx =
        e.key === 'ArrowLeft'
          ? Math.max(0, idx - 1)
          : Math.min(keys.length - 1, idx + 1)
      const next = keys[nextIdx]
      if (next && next !== chain) {
        onSelect?.(next)
        setStrokeToKey(next)
        scrollToKey(next)
      }
    },
    [chain, onSelect, scrollToKey, setStrokeToKey]
  )

  return { footerRef, itemRefs, scrollToKey, strokeRef, onKeyDown }
}
