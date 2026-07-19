import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

type Props = {
  chain: string
  items: string[]
  onSelect?: (key: string) => void
}

const strokeAdditionalSpace = 12
const minStrokeWidth = 44
const idleTimeAfterScrollStop = 500
const wheelIdleTime = 200
const behavior: ScrollBehavior = 'smooth'

export const useCenteredSnapCarousel = ({ chain, items, onSelect }: Props) => {
  // Stable key of the pill set, so the measurement effects re-run when chains
  // are added/removed (or the list populates async) — otherwise the ring would
  // stay measured against a stale/absent pill until the next chain change.
  const itemsKey = items.join('|')

  const footerElRef = useRef<HTMLDivElement | null>(null)
  // Callback ref that also tracks the node in state. The modal mounts through
  // BodyPortal, whose useBody defers rendering by one commit (body starts null),
  // so on a warm remount the footer isn't attached yet when the effects first
  // run — they'd bind listeners / measure against null and, with otherwise
  // stable deps, never re-run (breaking scroll + ring until a click). Depending
  // on `footerNode` re-runs those effects the moment the carousel mounts.
  const [footerNode, setFooterNode] = useState<HTMLDivElement | null>(null)
  const footerRef = useCallback((node: HTMLDivElement | null) => {
    footerElRef.current = node
    setFooterNode(node)
  }, [])
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const prevChain = useRef<string | null>(null)
  const strokeRef = useRef<HTMLDivElement>(null)
  const idleTimer = useRef<number | null>(null)
  // True while a programmatic scroll (click / settle / chain-change centering)
  // AND the scroll-snap tail it triggers are in flight. Live ring tracking is
  // suppressed while true, so it can't override the authoritative setStrokeToKey
  // width with a nearest-pill guess. Set in scrollToKey; cleared only when the
  // scroll fully settles (selectNearest) or as soon as the user takes over
  // (wheel / pointerdown) — NOT the instant the target scrollLeft is reached,
  // because scroll-snap keeps firing scroll events after that.
  const programmaticScroll = useRef(false)
  const wheelIdleTimer = useRef<number | null>(null)
  // Pre-measured center (in scroll-content coordinates) and width of every pill,
  // so during a scroll we can resize the ring to the pill entering the center
  // without measuring the DOM on each scroll event.
  const chainMetrics = useRef<
    { chain: string; center: number; width: number }[]
  >([])
  const viewportWidth = useRef(0)

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
      const container = footerElRef.current
      const el = itemRefs.current[key]
      if (!container || !el) return
      const left = computeCenteredLeft(container, el)
      if (Math.abs(container.scrollLeft - left) > 1) {
        // Suppress live tracking for this scroll and its scroll-snap tail, so it
        // can't override the ring; cleared on settle (selectNearest) / user input.
        programmaticScroll.current = true
        container.scrollTo({ left, behavior: b ?? behavior })
      }
    },
    [computeCenteredLeft]
  )

  const setStrokeToKey = useCallback(
    (key?: string) => {
      const container = footerElRef.current
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

  // Cache every pill's center + width once (scroll-invariant content coords), so
  // the scroll handler can look them up instead of measuring the DOM mid-scroll.
  const measureMetrics = useCallback(() => {
    const container = footerElRef.current
    if (!container) return

    const containerLeft = container.getBoundingClientRect().left
    viewportWidth.current = container.clientWidth

    const metrics: { chain: string; center: number; width: number }[] = []
    for (const [key, el] of Object.entries(itemRefs.current)) {
      if (!el) continue
      const r = el.getBoundingClientRect()
      metrics.push({
        chain: key,
        center: r.left - containerLeft + container.scrollLeft + r.width / 2,
        width: r.width,
      })
    }
    chainMetrics.current = metrics
  }, [])

  // Resize the ring to the pill nearest the viewport center, using cached widths
  // and only the live scrollLeft — so the ring snaps to the next pill the instant
  // it crosses the center while scrolling.
  const setStrokeToNearestScrollPosition = useCallback(() => {
    const container = footerElRef.current
    const stroke = strokeRef.current
    if (!container || !stroke || chainMetrics.current.length === 0) return

    const center = container.scrollLeft + viewportWidth.current / 2

    let best: (typeof chainMetrics.current)[number] | null = null
    let bestDist = Infinity
    for (const metric of chainMetrics.current) {
      const dist = Math.abs(metric.center - center)
      if (dist < bestDist) {
        bestDist = dist
        best = metric
      }
    }
    if (!best) return

    const width = Math.max(
      minStrokeWidth,
      Math.ceil(best.width + strokeAdditionalSpace)
    )
    stroke.style.width = `${width}px`
  }, [])

  const selectNearest = useCallback(() => {
    // The scroll has fully settled (incl. scroll-snap): end the programmatic
    // suppression so the next genuine user scroll drives the ring again.
    programmaticScroll.current = false

    const container = footerElRef.current
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

    measureMetrics()
    setStrokeToKey(chain)

    const b: ScrollBehavior =
      prevChain.current && prevChain.current !== chain ? behavior : 'auto'
    scrollToKey(chain, b)

    prevChain.current = chain

    const id = requestAnimationFrame(() => {
      measureMetrics()
      setStrokeToKey(chain)
      scrollToKey(chain, b)
    })

    return () => cancelAnimationFrame(id)
  }, [chain, footerNode, itemsKey, measureMetrics, scrollToKey, setStrokeToKey])

  useEffect(() => {
    const el = footerNode
    if (!el) return

    const onScroll = () => {
      // Only a genuine user scroll (wheel, touch, or scrollbar) drives the live
      // resize. Programmatic scrolls and their scroll-snap tail stay suppressed
      // until they settle, so they never override the ring on entry.
      if (!programmaticScroll.current) setStrokeToNearestScrollPosition()

      if (idleTimer.current !== null) window.clearTimeout(idleTimer.current)
      idleTimer.current = window.setTimeout(
        selectNearest,
        idleTimeAfterScrollStop
      )
    }

    const onWheel = (e: WheelEvent) => {
      // The user is taking over: end programmatic suppression so this gesture
      // (and its momentum/snap) drives the ring. A boundary wheel that produces
      // no scroll event just leaves this false — nothing gets stuck.
      programmaticScroll.current = false
      // Refresh the cached widths at the start of a wheel gesture: the mount-time
      // measurement can be stale (fonts/icons finalize after it), which made the
      // ring size wrong for the next pill on the very first scroll.
      if (wheelIdleTimer.current === null) {
        measureMetrics()
      } else {
        window.clearTimeout(wheelIdleTimer.current)
      }
      wheelIdleTimer.current = window.setTimeout(() => {
        wheelIdleTimer.current = null
      }, wheelIdleTime)

      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY
      }
    }

    const onPointerDown = () => {
      // Touch/pointer gesture start: end programmatic suppression and refresh
      // widths so touch swipes and scrollbar drags also track the ring live.
      programmaticScroll.current = false
      measureMetrics()
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('wheel', onWheel, { passive: true })
    el.addEventListener('pointerdown', onPointerDown, { passive: true })

    return () => {
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerdown', onPointerDown)
      if (idleTimer.current !== null) window.clearTimeout(idleTimer.current)
      if (wheelIdleTimer.current !== null) {
        window.clearTimeout(wheelIdleTimer.current)
        // Null it so a re-created effect doesn't mistake this cancelled timer
        // for an active debounce and skip the gesture-start measureMetrics().
        wheelIdleTimer.current = null
      }
    }
  }, [
    footerNode,
    measureMetrics,
    selectNearest,
    setStrokeToNearestScrollPosition,
  ])

  useEffect(() => {
    const onResize = () => {
      measureMetrics()
      setStrokeToKey()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [measureMetrics, setStrokeToKey])

  useEffect(() => {
    if (!chain) return

    // Clicking a pill corrects the ring because it re-measures after the layout
    // has settled. Do the same on entry / chain / list change: re-measure the
    // current pill once fonts are ready, and on a couple of delayed ticks, plus
    // whenever it resizes — so the ring is right without needing a click even if
    // the pill reaches its final size a bit after mount.
    let cancelled = false
    const remeasure = () => {
      if (cancelled) return
      measureMetrics()
      setStrokeToKey(chain)
      scrollToKey(chain, 'auto')
    }

    const raf = requestAnimationFrame(remeasure)
    const delayed = [
      window.setTimeout(remeasure, 100),
      window.setTimeout(remeasure, 300),
    ]
    void document.fonts.ready.then(remeasure)

    const el = itemRefs.current[chain]
    const observer =
      el && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(remeasure)
        : null
    if (el && observer) observer.observe(el)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      delayed.forEach(id => window.clearTimeout(id))
      observer?.disconnect()
    }
  }, [chain, footerNode, itemsKey, measureMetrics, scrollToKey, setStrokeToKey])

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

  const setItemRef = useCallback((key: string, el: HTMLDivElement | null) => {
    itemRefs.current[key] = el
  }, [])

  return {
    footerRef,
    itemRefs,
    scrollToKey,
    strokeRef,
    onKeyDown,
    setItemRef,
  }
}
