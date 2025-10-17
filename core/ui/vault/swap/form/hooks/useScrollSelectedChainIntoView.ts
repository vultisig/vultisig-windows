import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'

type Props = {
  chain: string
  onSelect?: (key: string) => void
}

const strokeAdditionalSpace = 12
const minStrokeWidth = 44
const idleTimeAfterScrollStop = 500
const behavior: ScrollBehavior = 'smooth'

export const useCenteredSnapCarousel = ({ chain, onSelect }: Props) => {
  const footerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const prevChain = useRef<string | null>(null)
  const strokeRef = useRef<HTMLDivElement>(null)
  const idleTimer = useRef<number | null>(null)

  const computeCenteredLeft = useCallback(
    (container: HTMLDivElement, el: HTMLDivElement) => {
      const cRect = container.getBoundingClientRect()
      const eRect = el.getBoundingClientRect()
      const delta =
        eRect.left - cRect.left - (container.clientWidth - eRect.width) / 2
      const maxLeft = container.scrollWidth - container.clientWidth

      return Math.min(Math.max(0, container.scrollLeft + delta), maxLeft)
    },
    []
  )

  const scrollToKey = useCallback(
    (key: string, b?: ScrollBehavior) => {
      const container = footerRef.current
      const el = itemRefs.current[key]
      if (!container || !el) return
      const left = computeCenteredLeft(container, el)
      if (Math.abs(container.scrollLeft - left) > 1) {
        container.scrollTo({ left, behavior: b ?? behavior })
      }
    },
    [computeCenteredLeft]
  )

  const setStrokeToKey = useCallback(
    (key?: string) => {
      const container = footerRef.current
      const stroke = strokeRef.current
      const el = key
        ? itemRefs.current[key]
        : chain
          ? itemRefs.current[chain]
          : null

      if (!container || !stroke || !el) return

      const r = el.getBoundingClientRect()
      const width = Math.max(
        minStrokeWidth,
        Math.ceil(r.width + strokeAdditionalSpace)
      )

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

    if (bestKey && bestKey !== chain) onSelect?.(bestKey)
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

    setStrokeToKey(chain)

    const b: ScrollBehavior =
      prevChain.current && prevChain.current !== chain ? behavior : 'auto'
    scrollToKey(chain, b)

    prevChain.current = chain

    const id = requestAnimationFrame(() => {
      setStrokeToKey(chain)
      scrollToKey(chain, b)
    })

    return () => cancelAnimationFrame(id)
  }, [chain, scrollToKey, setStrokeToKey])

  useEffect(() => {
    const el = footerRef.current
    if (!el) return

    const onScroll = () => {
      if (idleTimer.current !== null) window.clearTimeout(idleTimer.current)
      idleTimer.current = window.setTimeout(
        selectNearest,
        idleTimeAfterScrollStop
      )
    }

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY
      }
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('wheel', onWheel, { passive: true })

    return () => {
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('wheel', onWheel)
      if (idleTimer.current !== null) window.clearTimeout(idleTimer.current)
    }
  }, [selectNearest])

  useEffect(() => {
    const onResize = () => setStrokeToKey()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [setStrokeToKey])

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
