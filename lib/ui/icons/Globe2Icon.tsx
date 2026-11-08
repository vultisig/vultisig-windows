import { SvgProps } from '@lib/ui/props'

/** Globe with one meridian and the equator. */
export const Globe2Icon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <path
      d="M12.5 9.99967C12.5 13.8657 11.3807 16.9997 10 16.9997C8.61929 16.9997 7.5 13.8657 7.5 9.99967C7.5 6.13368 8.61929 2.99967 10 2.99967C11.3807 2.99967 12.5 6.13368 12.5 9.99967Z"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
    <path
      d="M2.99967 10H16.9997"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
    <path
      d="M16.9997 9.99967C16.9997 13.8657 13.8657 16.9997 9.99967 16.9997C6.13368 16.9997 2.99967 13.8657 2.99967 9.99967C2.99967 6.13368 6.13368 2.99967 9.99967 2.99967C13.8657 2.99967 16.9997 6.13368 16.9997 9.99967Z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
  </svg>
)
