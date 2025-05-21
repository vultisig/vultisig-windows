import { FC, SVGProps } from 'react'

export const ShieldCheckIcon: FC<SVGProps<SVGSVGElement>> = ({
  fill = 'none',
  height = '1em',
  stroke = 'currentColor',
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  strokeWidth = 1.5,
  width = '1em',
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M9 12.0005L11 14.0005L15 10.0005M20 13.0004C20 18.0004 16.5 20.5005 12.34 21.9505C12.1222 22.0243 11.8855 22.0207 11.67 21.9405C7.5 20.5005 4 18.0004 4 13.0004V6.00045C4 5.73523 4.10536 5.48088 4.29289 5.29334C4.48043 5.10581 4.73478 5.00045 5 5.00045C7 5.00045 9.5 3.80045 11.24 2.28045C11.4519 2.09945 11.7214 2 12 2C12.2786 2 12.5481 2.09945 12.76 2.28045C14.51 3.81045 17 5.00045 19 5.00045C19.2652 5.00045 19.5196 5.10581 19.7071 5.29334C19.8946 5.48088 20 5.73523 20 6.00045V13.0004Z" />
  </svg>
)
