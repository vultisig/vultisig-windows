import { SvgProps } from '@lib/ui/props'

/**
 * Traffic-cone icon for the "Old backups will stop working" warning on the
 * "Before you reshare" screen. Exported from the Figma reshare redesign; uses
 * `currentColor` so the warning color is set on the wrapper.
 */
export const ReshareOldBackupsIcon = (props: SvgProps) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M15.3426 8.39844H8.65625"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.2717 14.3984H6.72852"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.3996 20.3984H3.59961"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.80078 20.4016L9.93318 4.43436C10.0928 3.93756 10.5548 3.60156 11.0756 3.60156H12.926C13.4468 3.60156 13.9088 3.93756 14.0684 4.43436L19.2008 20.4016"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
