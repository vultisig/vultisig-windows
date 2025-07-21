import { Animation } from '@lib/ui/animations/Animation'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { ComponentProps, FC } from 'react'
import styled, { keyframes } from 'styled-components'

import { Match } from '../base/Match'

type SpinnerKind = 'primary' | 'secondary'

type SpinnerWrapperProps = {
  size?: number | string
  kind?: SpinnerKind
}

const SpinnerWrapper = styled.div<SpinnerWrapperProps>`
  position: relative;
  ${({ size = '1em' }) => sameDimensions(size)};
`

const animationForRotation = keyframes`
  to {
    transform: rotate(360deg);
  }
`

const SecondarySpinner = styled.span`
  width: 1em;
  height: 1em;
  display: inline-block;

  border: 0.08em solid;
  border-radius: 100%;
  border-top-color: transparent;

  animation: ${animationForRotation} 1s infinite linear;
`

export const Spinner: FC<ComponentProps<typeof SpinnerWrapper>> = ({
  kind = 'primary',
  ...props
}) => {
  return (
    <Match
      value={kind}
      primary={() => (
        <SpinnerWrapper {...props}>
          <Animation src="/core/animations/spinner.riv" />
        </SpinnerWrapper>
      )}
      secondary={() => <SecondarySpinner {...props} />}
    />
  )
}
