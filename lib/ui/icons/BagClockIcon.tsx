import { SvgProps } from '@lib/ui/props'
import { useId } from 'react'

/** A money bag with a clock: a reward that has already been paid out. */
export const BagClockIcon = (props: SvgProps) => {
  const clockHandMaskId = useId()

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      fill="none"
      {...props}
    >
      <path
        d="M10 5.2C10 6.30456 9.10456 7.2 8 7.2C6.89544 7.2 6 6.30456 6 5.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.9233 6.29942L12.6605 4.4603C12.4917 3.2779 11.479 2.39974 10.2847 2.39974H5.71838C4.52398 2.39974 3.51142 3.27798 3.34254 4.4603L2.42822 10.8603C2.22166 12.3061 3.34358 13.5997 4.80406 13.5997H6.59158"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <mask id={clockHandMaskId}>
        <rect width="16" height="16" fill="white" />
        <path
          d="M11.2 10V11.2L12.15 11.95"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </mask>
      <circle
        cx="11.2"
        cy="11.2"
        r="3.2"
        fill="currentColor"
        mask={`url(#${clockHandMaskId})`}
      />
    </svg>
  )
}
