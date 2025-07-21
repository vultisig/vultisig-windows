import { LinearGradient } from '@lib/ui/icons/LinearGradient'
import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

type CheckIconProps = SvgProps & {
  gradient?: boolean
}

export const CheckIcon: FC<CheckIconProps> = ({ gradient, ...props }) => (
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
