import { FC, SVGProps } from 'react'

export const TwitterIcon: FC<SVGProps<SVGSVGElement>> = ({
  fill = 'currentColor',
  height = '1em',
  width = '1em',
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      width,
    }}
  >
    <path d="M13.6,10.7l6.1-7.1h-1.4l-5.3,6.1-4.2-6.1H3.8l6.4,9.3-6.4,7.4h1.4l5.6-6.5,4.5,6.5h4.9l-6.6-9.6ZM11.6,13h0s-.6-.9-.6-.9l-5.1-7.4h2.2l4.2,5.9.6.9,5.4,7.7h-2.2l-4.4-6.3Z" />
  </svg>
)
