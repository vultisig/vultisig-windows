import { SvgProps } from '@lib/ui/props'

/** A small right chevron on a 20 grid. */
export const ChevronRightSmallIcon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <path
      d="M8.33333 13.3333L11.0774 10.5892C11.4028 10.2638 11.4028 9.73617 11.0774 9.41075L8.33333 6.66667"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
  </svg>
)
