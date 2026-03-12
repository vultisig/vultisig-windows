import { SvgProps } from '@lib/ui/props'

/** Closed padlock icon for password/vault actions. */
export const LockClosedIcon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M10.0002 11.6666V14.1666M6.4585 8.12496V5.83329C6.4585 3.87728 8.04415 2.29163 10.0002 2.29163C11.744 2.29163 13.1935 3.55193 13.4874 5.21138M5.62516 17.7083H14.3752C15.2957 17.7083 16.0418 16.9621 16.0418 16.0416V9.79163C16.0418 8.87113 15.2957 8.12496 14.3752 8.12496H5.62516C4.70469 8.12496 3.9585 8.87113 3.9585 9.79163V16.0416C3.9585 16.9621 4.70469 17.7083 5.62516 17.7083Z" />
  </svg>
)
