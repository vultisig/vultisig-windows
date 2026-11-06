import { SvgProps } from '@lib/ui/props'

/** A cloud with a downward arrow. */
export const CloudDownloadIcon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <path
      d="M10 15V10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.7503 15L10.0003 17L8.25033 15H11.7503Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.1657 12.4877C15.8377 11.6787 16.9997 9.98167 16.9997 7.99967C16.9997 5.23867 14.7607 2.99967 11.9997 2.99967C9.50967 2.99967 7.46067 4.82567 7.07967 7.20767C6.74367 7.07767 6.38167 6.99967 5.99967 6.99967C4.34267 6.99967 2.99967 8.34267 2.99967 9.99967C2.99967 11.4617 4.04667 12.6767 5.43167 12.9427"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
