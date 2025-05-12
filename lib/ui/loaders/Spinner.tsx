import { Animation } from '@lib/ui/animations/Animation'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { ComponentProps, FC } from 'react'
import styled from 'styled-components'

type SpinnerWrapperProps = {
  size?: number | string
}

const SpinnerWrapper = styled.div<SpinnerWrapperProps>`
  position: relative;
  ${({ size = '1em' }) => sameDimensions(size)};
`

export const Spinner: FC<ComponentProps<typeof SpinnerWrapper>> = props => {
  return (
    <SpinnerWrapper {...props}>
      <Animation src="/core/animations/spinner.riv" />
    </SpinnerWrapper>
  )
}
