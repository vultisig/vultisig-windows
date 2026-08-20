import { SvgProps } from '@lib/ui/props'

/**
 * A rocket burst with sparkles around it, used to mark reward and referral
 * promos. Sized on a 20x20 grid to match the other promo banner glyphs.
 */
export const FireworksIcon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <path
      d="M14.5 9.5C13.146 9.958 11 10.604 11 17C11 10.604 8.854 9.958 7.5 9.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.72 3.529 11.199 2.777 10.447 1.256C10.279.915 9.718.915 9.551 1.256l-.752 1.521-1.521.752A.554.554 0 0 0 7 4.977c0 .19.107.364.278.448l1.521.752.752 1.521a.555.555 0 0 0 .448.278.555.555 0 0 0 .448-.278l.752-1.521 1.521-.752A.554.554 0 0 0 13 4.977a.554.554 0 0 0-.28-.448Z"
      fill="currentColor"
    />
    <path
      d="M5.72 13.529 4.199 12.777l-.752-1.521c-.168-.341-.729-.341-.896 0l-.752 1.521-1.521.752A.554.554 0 0 0 0 14.977c0 .19.107.364.278.448l1.521.752.752 1.521a.555.555 0 0 0 .448.278.555.555 0 0 0 .448-.278l.752-1.521 1.521-.752A.554.554 0 0 0 6 14.977a.554.554 0 0 0-.28-.448Z"
      fill="currentColor"
    />
    <path
      d="M19.72 13.529 18.199 12.777l-.752-1.521c-.168-.341-.729-.341-.896 0l-.752 1.521-1.521.752a.554.554 0 0 0-.278.448c0 .19.107.364.278.448l1.521.752.752 1.521a.555.555 0 0 0 .448.278.555.555 0 0 0 .448-.278l.752-1.521 1.521-.752a.554.554 0 0 0 .278-.448.554.554 0 0 0-.28-.448Z"
      fill="currentColor"
    />
    <path
      d="M3.25 8.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"
      fill="currentColor"
    />
    <path
      d="M16.75 8.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"
      fill="currentColor"
    />
  </svg>
)
