import { FC, SVGProps } from 'react'

export const ChevronLeftIcon: FC<SVGProps<SVGSVGElement>> = ({
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
    <path d="M15 18L9 12L15 6" />
  </svg>
)
