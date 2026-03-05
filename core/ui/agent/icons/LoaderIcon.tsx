import { SvgProps } from '@lib/ui/props'
import styled, { css, keyframes } from 'styled-components'

type LoaderIconProps = SvgProps & {
  spinning?: boolean
}

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const SpinningSvg = styled.svg<{ $spinning?: boolean }>`
  ${({ $spinning }) =>
    $spinning &&
    css`
      animation: ${spin} 1s linear infinite;
    `}
`

export const LoaderIcon = ({ spinning, ...props }: LoaderIconProps) => (
  <SpinningSvg
    $spinning={spinning}
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    fill="none"
    {...props}
  >
    <path
      d="M8.00021 1.83325L8.00001 4.16659M8.00021 11.8333V14.1666M1.83334 8.00038H4.16668M11.8333 8.00038H14.1667M3.63966 3.63929L5.28944 5.28935M10.7107 10.7103L12.3607 12.3603M3.63985 12.3607L5.28976 10.7109M10.7109 5.28967L12.3608 3.63976"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SpinningSvg>
)
