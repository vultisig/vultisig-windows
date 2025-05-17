import { FC, SVGProps } from 'react'

export const MegaphoneIcon: FC<SVGProps<SVGSVGElement>> = ({
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
    <path d="M11.6 16.8C11.4949 17.1808 11.3159 17.5372 11.0731 17.8488C10.8303 18.1605 10.5285 18.4212 10.1849 18.6162C9.84132 18.8112 9.4627 18.9367 9.07065 18.9853C8.6786 19.034 8.28081 19.005 7.89997 18.9C7.51914 18.7949 7.16273 18.6159 6.85109 18.3731C6.53945 18.1303 6.27868 17.8285 6.08368 17.4849C5.88867 17.1413 5.76325 16.7627 5.71457 16.3706C5.6659 15.9786 5.69492 15.5808 5.79997 15.2M3 11L21 6V18L3 14V11Z" />
  </svg>
)
