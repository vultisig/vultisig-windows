import { FC, SVGProps } from 'react'

export const ArrowLeft: FC<SVGProps<SVGSVGElement>> = ({
  fill = 'none',
  height = 24,
  stroke = 'white',
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  strokeWidth = 2,
  width = 24,
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
    <path d="M14 7L9 12" />
    <path d="M9 12L14 17" />
  </svg>
)

export const Check: FC<SVGProps<SVGSVGElement>> = ({
  fill = 'none',
  height = 24,
  stroke = 'white',
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  strokeWidth = 2,
  width = 24,
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
    <path d="M20 6L9 17L4 12" />
  </svg>
)

export const Close: FC<SVGProps<SVGSVGElement>> = ({
  fill = 'none',
  height = 24,
  stroke = 'white',
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  strokeWidth = 2,
  width = 24,
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
    <path d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001" />
  </svg>
)

export const SquareArrow: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M17.05 21H6.95C5.75 21 5.09 21 4.5 20.7C3.98 20.43 3.56 20.02 3.3 19.5C3 18.91 3 18.25 3 17.05V6.95C3 5.75 3 5.09 3.3 4.5C3.57 3.98 3.98 3.57 4.5 3.3C5.09 3 5.75 3 6.95 3H9.25C9.66 3 10 3.34 10 3.75C10 4.16 9.66 4.5 9.25 4.5H6.95C5.98 4.5 5.45 4.5 5.18 4.64C4.94 4.76 4.76 4.95 4.63 5.19C4.49 5.46 4.49 5.99 4.49 6.96V17.06C4.49 18.03 4.49 18.56 4.63 18.83C4.75 19.07 4.94 19.25 5.18 19.38C5.45 19.52 5.98 19.52 6.95 19.52H17.05C18.02 19.52 18.55 19.52 18.82 19.38C19.06 19.26 19.24 19.07 19.37 18.83C19.51 18.56 19.51 18.03 19.51 17.06V14.76C19.51 14.35 19.85 14.01 20.26 14.01C20.67 14.01 21.01 14.35 21.01 14.76V17.06C21.01 18.26 21.01 18.92 20.71 19.51C20.44 20.03 20.03 20.45 19.51 20.71C18.92 21.01 18.26 21.01 17.06 21.01L17.05 21ZM11 13.75C10.81 13.75 10.62 13.68 10.47 13.53C10.18 13.24 10.18 12.76 10.47 12.47L18.44 4.5H13.75C13.34 4.5 13 4.16 13 3.75C13 3.34 13.34 3 13.75 3H20.25C20.35 3 20.45 3.02 20.54 3.06C20.63 3.1 20.71 3.15 20.78 3.22C20.85 3.29 20.91 3.37 20.94 3.46C20.98 3.55 21 3.65 21 3.75V10.25C21 10.66 20.66 11 20.25 11C19.84 11 19.5 10.66 19.5 10.25V5.56L11.53 13.53C11.38 13.68 11.19 13.75 11 13.75Z" />
  </svg>
)

export const TriangleWarning: FC<SVGProps<SVGSVGElement>> = ({
  fill = 'none',
  height = 24,
  stroke = 'white',
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  strokeWidth = 2,
  width = 24,
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
    <path d="M12 9.00006V13.0001M4.37891 15.1999C3.46947 16.775 3.01489 17.5629 3.08281 18.2092C3.14206 18.7729 3.43792 19.2851 3.89648 19.6182C4.42204 20.0001 5.3309 20.0001 7.14853 20.0001H16.8515C18.6691 20.0001 19.5778 20.0001 20.1034 19.6182C20.5619 19.2851 20.8579 18.7729 20.9172 18.2092C20.9851 17.5629 20.5307 16.775 19.6212 15.1999L14.7715 6.79986C13.8621 5.22468 13.4071 4.43722 12.8135 4.17291C12.2957 3.94236 11.704 3.94236 11.1862 4.17291C10.5928 4.43711 10.1381 5.22458 9.22946 6.79845L4.37891 15.1999ZM12.0508 16.0001V16.1001L11.9502 16.1003V16.0001H12.0508Z" />
  </svg>
)
