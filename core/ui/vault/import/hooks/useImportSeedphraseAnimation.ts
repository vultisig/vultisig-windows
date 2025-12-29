import { useRive } from '@rive-app/react-canvas'
import { useEffect, useState } from 'react'

export const useImportSeedphraseAnimation = () => {
  const [showContent, setShowContent] = useState(false)

  const { RiveComponent } = useRive({
    src: '/core/animations/import-seedphrase.riv',
    autoplay: true,
  })

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowContent(true)
    }, 3000)

    return () => clearTimeout(timeoutId)
  }, [])

  return {
    RiveComponent,
    showContent,
  }
}
