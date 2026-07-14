import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'

type Props = {
  chain: string
  onSelect?: (key: string) => void
}

const idleTimeAfterScrollStop = 500
const behavior: ScrollBehavior = 'smooth'

export const useCenteredSnapCarousel = ({ chain, onSelect }: Props) => {
  const footerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const prevChain = useRef<string | null>(null)
  const idleTimer = useRef<number | null>(null)
  const prevScrollLeft = useRef(0)
  const scrollTarget = useRef<string | null>(null)
  const programmaticScroll = useRef(false)
  const programmaticTimer = useRef<number | null>(null)

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
        programmaticScroll.current = true
        if (programmaticTimer.current !== null) {
          window.clearTimeout(programmaticTimer.current)
        }
        programmaticTimer.current = window.setTimeout(() => {
          programmaticScroll.current = false
        }, 450)
        container.scrollTo({ left, behavior: b ?? behavior })
      }
    },
    [computeCenteredLeft]
  )

  const setCenteredKey = useCallback(
    (key?: string) => {
      const activeKey = key ?? chain
      for (const [k, el] of Object.entries(itemRefs.current)) {
        if (el) el.dataset.centered = String(k === activeKey)
      }
    },
    [chain]
  )

  const selectNearest = useCallback(() => {
    const container = footerRef.current
    if (!container) return
    const cRect = container.getBoundingClientRect()
    const centerX = cRect.left + cRect.width / 2

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

    scrollTarget.current = null

    if (bestKey && bestKey !== chain) onSelect?.(bestKey)
    if (bestKey) {
      setCenteredKey(bestKey)
      scrollToKey(bestKey)
    } else {
      setCenteredKey(chain)
      scrollToKey(chain)
    }
  }, [chain, onSelect, scrollToKey, setCenteredKey])

  useLayoutEffect(() => {
    if (!chain) return

    setCenteredKey(chain)

    const b: ScrollBehavior =
      prevChain.current && prevChain.current !== chain ? behavior : 'auto'
    scrollToKey(chain, b)

    prevChain.current = chain

    const id = requestAnimationFrame(() => {
      setCenteredKey(chain)
      scrollToKey(chain, b)
    })

    return () => cancelAnimationFrame(id)
  }, [chain, scrollToKey, setCenteredKey])

  useEffect(() => {
    const el = footerRef.current
    if (!el) return

    prevScrollLeft.current = el.scrollLeft

    const onScroll = () => {
      const delta = el.scrollLeft - prevScrollLeft.current
      prevScrollLeft.current = el.scrollLeft

      if (!programmaticScroll.current && Math.abs(delta) > 0.5) {
        const dir = delta > 0 ? 1 : -1
        const keys = Object.keys(itemRefs.current)
        const clampIdx = (i: number) =>
          Math.min(keys.length - 1, Math.max(0, i))

        if (scrollTarget.current === null) {
          const idx = keys.indexOf(chain)
          scrollTarget.current = keys[clampIdx(idx + dir)] ?? null
        } else {
          const targetEl = itemRefs.current[scrollTarget.current]
          if (targetEl) {
            const cRect = el.getBoundingClientRect()
            const centerX = cRect.left + cRect.width / 2
            const tRect = targetEl.getBoundingClientRect()
            const targetCenter = tRect.left + tRect.width / 2
            const passed =
              dir > 0 ? targetCenter < centerX : targetCenter > centerX
            if (passed) {
              const idx = keys.indexOf(scrollTarget.current)
              scrollTarget.current = keys[clampIdx(idx + dir)]
            }
          }
        }

        if (scrollTarget.current) setCenteredKey(scrollTarget.current)
      }

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
      if (programmaticTimer.current !== null) {
        window.clearTimeout(programmaticTimer.current)
      }
    }
  }, [chain, selectNearest, setCenteredKey])

  useEffect(() => {
    const onResize = () => {
      setCenteredKey()
      scrollToKey(chain, 'auto')
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [chain, scrollToKey, setCenteredKey])

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
        setCenteredKey(next)
        scrollToKey(next)
      }
    },
    [chain, onSelect, scrollToKey, setCenteredKey]
  )

  const setItemRef = useCallback((key: string, el: HTMLDivElement | null) => {
    itemRefs.current[key] = el
  }, [])

  return {
    footerRef,
    itemRefs,
    scrollToKey,
    setCenteredKey,
    onKeyDown,
    setItemRef,
  }
}
