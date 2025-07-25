import { LinearGradient } from '@lib/ui/icons/LinearGradient'
import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

type ShieldIconProps = SvgProps & {
  gradient?: boolean
}

export const ShieldIcon: FC<ShieldIconProps> = ({ gradient, ...props }) => (
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
    <path d="M20 13C20 18 16.5 20.5 12.34 21.95C12.1222 22.0238 11.8855 22.0202 11.67 21.94C7.5 20.5 4 18 4 13V5.99996C4 5.73474 4.10536 5.48039 4.29289 5.29285C4.48043 5.10532 4.73478 4.99996 5 4.99996C7 4.99996 9.5 3.79996 11.24 2.27996C11.4519 2.09896 11.7214 1.99951 12 1.99951C12.2786 1.99951 12.5481 2.09896 12.76 2.27996C14.51 3.80996 17 4.99996 19 4.99996C19.2652 4.99996 19.5196 5.10532 19.7071 5.29285C19.8946 5.48039 20 5.73474 20 5.99996V13Z" />
  </svg>
)
