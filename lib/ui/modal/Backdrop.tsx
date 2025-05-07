import { centerContent } from '@lib/ui/css/centerContent'
import { takeWholeSpace } from '@lib/ui/css/takeWholeSpace'
import { useKeyDown } from '@lib/ui/hooks/useKeyDown'
import { OnCloseProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import { ComponentProps, useRef } from 'react'
import styled from 'styled-components'

const Container = styled.div`
  z-index: 1;
  position: fixed;
  left: 0;
  top: 0;
  ${takeWholeSpace};
  ${centerContent};
  background: ${getColor('overlay')};
  backdrop-filter: blur(4px);
`

export const Backdrop = ({
  onClose,
  ...props
}: Partial<OnCloseProp> & ComponentProps<typeof Container>) => {
  const isPointerDownInside = useRef(false)
  useKeyDown('Escape', onClose)

  return (
    <Container
      onPointerDown={({ target, currentTarget }) => {
        if (target === currentTarget) {
          isPointerDownInside.current = true
        }
      }}
      onPointerUp={() => {
        if (isPointerDownInside.current) {
          onClose?.()
        }
        isPointerDownInside.current = false
      }}
      onPointerCancel={() => {
        isPointerDownInside.current = false
      }}
      {...props}
    />
  )
}
