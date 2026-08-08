import { SvgProps } from '@lib/ui/props'

/**
 * Concentric-dots icon for the "All co-signers must be online" warning on the
 * "Before you reshare" screen. Exported from the Figma reshare redesign; uses
 * `currentColor` so the warning color is set on the wrapper.
 */
export const ReshareCosignersIcon = (props: SvgProps) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M20.0996 2.89844C20.6519 2.89844 21.0996 3.34615 21.0996 3.89844C21.0996 4.45072 20.6519 4.89844 20.0996 4.89844C19.5473 4.89844 19.0996 4.45072 19.0996 3.89844C19.0996 3.34615 19.5473 2.89844 20.0996 2.89844Z"
      fill="currentColor"
      stroke="currentColor"
    />
    <path
      d="M20.0996 19.1016C20.6519 19.1016 21.0996 19.5493 21.0996 20.1016C21.0996 20.6538 20.6519 21.1016 20.0996 21.1016C19.5473 21.1016 19.0996 20.6538 19.0996 20.1016C19.0996 19.5493 19.5473 19.1016 20.0996 19.1016Z"
      fill="currentColor"
      stroke="currentColor"
    />
    <path
      d="M3.90039 19.1016C4.45268 19.1016 4.90039 19.5493 4.90039 20.1016C4.90039 20.6538 4.45268 21.1016 3.90039 21.1016C3.34811 21.1016 2.90039 20.6538 2.90039 20.1016C2.90039 19.5493 3.34811 19.1016 3.90039 19.1016Z"
      fill="currentColor"
      stroke="currentColor"
    />
    <path
      d="M3.90039 2.89844C4.45268 2.89844 4.90039 3.34615 4.90039 3.89844C4.90039 4.45072 4.45268 4.89844 3.90039 4.89844C3.34811 4.89844 2.90039 4.45072 2.90039 3.89844C2.90039 3.34615 3.34811 2.89844 3.90039 2.89844Z"
      fill="currentColor"
      stroke="currentColor"
    />
    <path
      d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
