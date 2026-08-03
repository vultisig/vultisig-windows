import { SvgProps } from '@lib/ui/props'
import styled, { keyframes } from 'styled-components'

const arcLength = 63

const rotate = keyframes`
  to {
    transform: rotate(360deg);
  }
`

const stretch = keyframes`
  0% {
    stroke-dasharray: 1, ${arcLength};
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 44, ${arcLength};
    stroke-dashoffset: -8;
  }
  100% {
    stroke-dasharray: 44, ${arcLength};
    stroke-dashoffset: -${arcLength - 1};
  }
`

/**
 * Indeterminate circular loader: the arc grows and shrinks while the whole ring
 * spins, so it reads as filling and emptying rather than just rotating.
 * Inherits the surrounding text color and is sized with `fontSize` at the usage
 * site.
 */
export const CircularProgressIndicator = (props: SvgProps) => (
  <Wrapper
    role="img"
    aria-label="loading"
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <Arc cx="12" cy="12" r="10" />
  </Wrapper>
)

const Wrapper = styled.svg`
  animation: ${rotate} 1.4s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const Arc = styled.circle`
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  animation: ${stretch} 1.4s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    stroke-dasharray: 16, ${arcLength};
  }
`
