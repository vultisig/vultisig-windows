import { SvgProps } from '@lib/ui/props'

/** A folded document with a pen over its corner. */
export const FilePenIcon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <path
      d="M4.00065 6.99967H7.00065C7.55265 6.99967 8.00065 6.55167 8.00065 5.99967V2.99967"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M15.9637 5.63567C15.7827 4.15267 14.5327 2.99967 13.0007 2.99967H8.41465C8.14965 2.99967 7.89465 3.10467 7.70765 3.29267L4.29365 6.70667C4.10565 6.89467 4.00065 7.14868 4.00065 7.41368V13.9997C4.00065 15.1237 4.62565 16.0907 5.53965 16.6047"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.00065 16.9921L9.50065 13.9921L14.2077 9.29309C14.5987 8.90209 15.2317 8.90209 15.6217 9.29309L16.7077 10.3791C17.0987 10.7701 17.0987 11.4031 16.7077 11.7931L12.0007 16.4921L9.00065 16.9921Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
