import { SvgProps } from '@lib/ui/props'

/** A calendar page with no days marked, for a single upcoming date. */
export const CalendarBlankIcon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <path
      d="M16.7996 4.7998H7.19961C5.21138 4.7998 3.59961 6.41158 3.59961 8.3998V15.5998C3.59961 17.588 5.21138 19.1998 7.19961 19.1998H16.7996C18.7878 19.1998 20.3996 17.588 20.3996 15.5998V8.3998C20.3996 6.41158 18.7878 4.7998 16.7996 4.7998Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.3996 8.3998C20.3996 6.41152 18.7879 4.7998 16.7996 4.7998H7.19961C5.21133 4.7998 3.59961 6.41152 3.59961 8.3998H20.3996Z"
      fill="currentColor"
    />
    <path
      d="M7.19922 4.80039V2.40039"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.8008 4.80039V2.40039"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
