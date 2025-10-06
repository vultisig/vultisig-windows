import { useEffect, useRef } from 'react'

type Callback = (size: Partial<Size>) => void
type Size = { height: number; width: number }
type Track = 'width' | 'height' | 'both'

type UseResizeObserverProps = {
  callback: Callback
  track?: Track
}

export const useResizeObserver = ({
  callback,
  track = 'both',
}: UseResizeObserverProps) => {
  const ref = useRef<HTMLElement>(null)
  const sizeRef = useRef<Size | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new ResizeObserver(([{ contentRect }]) => {
      const { height, width } = contentRect
      const prev = sizeRef.current
      const changed = {
        width: !prev || prev.width !== width,
        height: !prev || prev.height !== height,
        both: !prev || prev.width !== width || prev.height !== height,
      }[track]

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
