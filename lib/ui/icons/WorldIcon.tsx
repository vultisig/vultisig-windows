import { FC, SVGProps } from 'react'

export const WorldIcon: FC<SVGProps<SVGSVGElement>> = ({
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
    <path d="M19.7781 4.22184L4.22173 19.7782M21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12ZM18.5161 18.516C17.3165 19.7156 13.4267 17.7707 9.82802 14.172C6.22931 10.5733 4.28442 6.68352 5.48399 5.48395C6.68356 4.28438 10.5733 6.22927 14.172 9.82798C17.7708 13.4267 19.7156 17.3165 18.5161 18.516Z" />
  </svg>
)
