import { SvgProps } from '@lib/ui/props'

/** A small left chevron. */
export const ChevronLeftSmallIcon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <g>
      <path
        d="M11.3215 13.3333L8.57742 10.5892C8.25198 10.2638 8.25198 9.73617 8.57742 9.41075L11.3215 6.66667"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="var(--icon-accent, currentColor)"
      />
    </g>
  </svg>
)
