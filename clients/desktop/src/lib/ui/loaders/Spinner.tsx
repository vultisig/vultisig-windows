import { ClassNameProp } from '@lib/ui/props'
import { useRive } from '@rive-app/react-canvas'
import { FC } from 'react'
import styled from 'styled-components'

type Props = ClassNameProp & {
  size?: string
}

export const Spinner: FC<Props> = ({ size = '1em', className }) => {
  const { RiveComponent } = useRive({
    src: '/assets/animations/keygen-fast-vault/connecting-with-server.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
  })

  return (
    <SpinnerWrapper size={size} className={className}>
      <RiveComponent />
    </SpinnerWrapper>
  )
}

const SpinnerWrapper = styled.div<{
  size: number | string
}>`
  position: relative;
  width: ${({ size }) => size};
  height: ${({ size }) => size};
`
