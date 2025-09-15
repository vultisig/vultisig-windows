import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'

type Props = {
  chain: string
  onSelect?: (key: string) => void // called when scroll settles on a different chain
}

const scrollStillFrames = 8 // ~8 RAF frames “still” before snapping
const velocityEpsilon = 0.5 // px/frame considered motionless
const strokeExtra = 12 // px padding around chip inside stroke
const minStroke = 44 // don’t let stroke get too tiny

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
      // Stroke remains horizontally centered in the viewport via CSS; we resize only.
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
    // Regardless of whether key changed, ensure precise snap + stroke size.
    if (bestKey) {
      setStrokeToKey(bestKey)
      scrollToKey(bestKey)
    } else {
      setStrokeToKey(chain)
      scrollToKey(chain)
    }
  }, [chain, onSelect, scrollToKey, setStrokeToKey])

  // Keep selected chain centered when prop changes
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

  // Robust scroll settle detection (covers mouse wheel, touchpad momentum)
  useEffect(() => {
    const el = footerRef.current
    if (!el) return

    let raf = 0
    let last = el.scrollLeft
    let stillFrames = 0

    const tick = () => {
      const now = el.scrollLeft
      const delta = Math.abs(now - last)
      last = now

      if (delta < velocityEpsilon) {
        stillFrames++
        if (stillFrames >= scrollStillFrames) {
          stillFrames = 0
          selectNearest()
        }
      } else {
        stillFrames = 0
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [selectNearest])

  // Resize-aware: keep stroke sizing correct on layout changes
  useEffect(() => {
    const container = footerRef.current
    if (!container) return
    const ro = new ResizeObserver(() => {
      setStrokeToKey()
      if (prevChain.current) scrollToKey(prevChain.current)
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [scrollToKey, setStrokeToKey])

  // Observe chip size changes (fonts, i18n changes, etc.)
  useEffect(() => {
    const stroke = strokeRef.current
    if (!stroke) return
    const ro = new ResizeObserver(() => setStrokeToKey())
    // Observe current chips
    Object.values(itemRefs.current).forEach(el => el && ro.observe(el))
    return () => ro.disconnect()
  }, [setStrokeToKey])

  // Optional: keyboard navigation (left/right)
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
