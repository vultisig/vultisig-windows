import { useCore } from '@core/ui/state/core'
import { OnClickProp, ValueProp } from '@lib/ui/props'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { useMutation } from '@tanstack/react-query'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { toPng } from 'html-to-image'
import { useState } from 'react'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { savedImagePixelRatio } from './savedImagePixelRatio'

type SaveAsImageProps = ValueProp<ReactNode> & {
  fileName: string
  renderTrigger: (props: OnClickProp) => ReactNode
}

const Wrapper = styled.div`
  position: fixed;
  top: -9999px;
  left: -9999px;
  pointer-events: none;
  opacity: 0;
`

/**
 * Renders `value` off-screen and saves it as a PNG when the trigger is clicked.
 * The PNG is rendered at a fixed pixel ratio, so a saved QR stays readable
 * whatever the saving screen's pixel density. A failed save raises an error
 * toast; a cancelled desktop save dialog resolves normally and shows nothing.
 */
export const SaveAsImage = ({
  value,
  fileName,
  renderTrigger,
}: SaveAsImageProps) => {
  const [node, setNode] = useState<HTMLDivElement | null>(null)
  const { saveFile } = useCore()
  const { addToast } = useToast()
  const { t } = useTranslation()

  const { mutate: saveImage } = useMutation({
    mutationFn: async (node: HTMLDivElement) => {
      const dataUrl = await toPng(node, { pixelRatio: savedImagePixelRatio })
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '')
      const byteCharacters = atob(base64Data)
      const byteArrays = new Uint8Array(byteCharacters.length)

      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays[i] = byteCharacters.charCodeAt(i)
      }

      const blob = new Blob([byteArrays], { type: 'image/png' })

      return saveFile({
        name: `${fileName}.png`,
        blob,
      })
    },
    onError: () => {
      addToast({ message: t('failed_to_save_image'), status: 'error' })
    },
  })

  return (
    <>
      <Wrapper>
        <div ref={setNode}>{value}</div>
      </Wrapper>
      {node &&
        renderTrigger({
          onClick: () => saveImage(shouldBePresent(node)),
        })}
    </>
  )
}
