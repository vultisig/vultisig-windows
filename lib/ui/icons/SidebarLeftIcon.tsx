import { SvgProps } from '@lib/ui/props'

/** A window with its left sidebar filled, drawn 18 wide for Quick settings. */
export const SidebarLeftIcon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="0.9em"
    height="1em"
    viewBox="0 0 18 20"
    fill="none"
    {...props}
  >
    <g>
      <path
        d="M5.39971 3.99984H7.19971V15.9998H5.39971C3.90931 15.9998 2.69971 14.6558 2.69971 12.9998V6.99984C2.69971 5.34384 3.90931 3.99984 5.39971 3.99984Z"
        fill="var(--icon-accent, currentColor)"
      />
      <path
        d="M5.39971 3.99984H12.5997C14.0909 3.99984 15.2997 5.34298 15.2997 6.99984V12.9998C15.2997 14.6567 14.0909 15.9998 12.5997 15.9998H5.39971C3.90854 15.9998 2.69971 14.6567 2.69971 12.9998V6.99984C2.69971 5.34298 3.90854 3.99984 5.39971 3.99984Z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="var(--icon-accent, currentColor)"
      />
    </g>
  </svg>
)
