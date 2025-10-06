import { useEffect, useRef } from 'react'

type Callback = (size: Partial<Size>) => void
type Size = { height: number; width: number }
type Track = 'width' | 'height' | 'both'

export const useResizeObserver = (
  callback: Callback,
  track: Track = 'both'
) => {
  const ref = useRef<HTMLElement>(null)
  const sizeRef = useRef<Size | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new ResizeObserver(([{ contentRect }]) => {
      const { height, width } = contentRect
      const prev = sizeRef.current

      let changed = false

      switch (track) {
        case 'width':
          changed = !prev || prev.width !== width
          break
        case 'height':
          changed = !prev || prev.height !== height
          break
        case 'both':
          changed = !prev || prev.width !== width || prev.height !== height
          break
      }

      if (changed) {
        const result: Partial<Size> = {}

        sizeRef.current = { height, width }

        if (track === 'height' || track === 'both') result.height = height
        if (track === 'width' || track === 'both') result.width = width

        callback(result)
      }
    })

    observer.observe(element)

    return () => observer.disconnect()
  }, [callback, track])

  return ref
}
