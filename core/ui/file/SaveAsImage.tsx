import { useSaveFile } from '@core/ui/state/saveFile'
import { OnClickProp, ValueProp } from '@lib/ui/props'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useMutation } from '@tanstack/react-query'
import { toPng } from 'html-to-image'
import { useState } from 'react'
import { ReactNode } from 'react'
import styled from 'styled-components'

type SaveAsImageProps = ValueProp<ReactNode> & {
  fileName: string
  renderTrigger: (props: OnClickProp) => ReactNode
}

const Wrapper = styled.div`
  position: absolute;
  top: -9999px;
  left: -9999px;
  pointer-events: none;
  opacity: 0;
`

export const SaveAsImage = ({
  value,
  fileName,
  renderTrigger,
}: SaveAsImageProps) => {
  const [node, setNode] = useState<HTMLDivElement | null>(null)
  const saveFile = useSaveFile()

  const { mutate: saveImage } = useMutation({
    mutationFn: async (node: HTMLDivElement) => {
      const dataUrl = await toPng(node)
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
