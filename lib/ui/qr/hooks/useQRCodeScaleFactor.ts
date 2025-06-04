import { useEffect, useState } from 'react'

const normalScale = 1
const smallScale = 0.75

export const useQRCodeScaleFactor = (enabled: boolean) => {
  const [scale, setScale] = useState(normalScale)

  useEffect(() => {
    if (!enabled) return

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY > 0) {
        setScale(smallScale)
      } else {
        setScale(normalScale)
      }
    }

    window.addEventListener('wheel', handleWheel)
    return () => window.removeEventListener('wheel', handleWheel)
  }, [enabled])

  return scale
}
