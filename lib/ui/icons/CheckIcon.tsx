import { LinearGradient } from '@lib/ui/icons/LinearGradient'
import { SvgProps } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import styled, { css } from 'styled-components'

const Icon: FC<SvgProps> = ({ gradient, ...props }) => (
  <svg
    fill="none"
    height="1em"
    stroke={gradient ? 'url(#linearGradient)' : 'currentColor'}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    {gradient && <LinearGradient />}
    <path d="M20 6L9 17L4 12" />
  </svg>
)

export const CheckIcon = styled(Icon)`
  ${({ color }) =>
    color
      ? css`
          color: ${getColor(color)};
        `
      : css``}
`
