import { FC, SVGProps } from 'react'

export const LinkTwoOffIcon: FC<SVGProps<SVGSVGElement>> = ({
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
    <path d="M9 17H7C5.67392 17 4.40215 16.4732 3.46447 15.5355C2.52678 14.5979 2 13.3261 2 12C2 10.6739 2.52678 9.40215 3.46447 8.46447C4.40215 7.52678 5.67392 7 7 7M15 7H17C17.9286 7 18.8388 7.25857 19.6287 7.74675C20.4185 8.23492 21.0569 8.9334 21.4721 9.76393C21.8874 10.5945 22.0632 11.5242 21.9798 12.449C21.8964 13.3738 21.5571 14.2572 21 15M8 12H12M2 2L22 22" />
  </svg>
)
