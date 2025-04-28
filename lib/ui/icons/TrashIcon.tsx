import { FC, SVGProps } from 'react'

export const TrashIcon: FC<SVGProps<SVGSVGElement>> = ({
  fill = 'none',
  height = '1em',
  stroke = '#f0f4fc',
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
    <path d="M3 6H21M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6M10 11V17M14 11V17" />
  </svg>
)
