import { SvgProps } from '@lib/ui/props'
import { useId } from 'react'

export const TransactionReceiveIcon = (props: SvgProps) => {
  const id = useId()

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <g clipPath={`url(#${id})`}>
        <path d="M7.625 6.5L6 8.125L4.375 6.5M6 3.875V7.75M6 10.625C3.44568 10.625 1.375 8.5543 1.375 6C1.375 3.44568 3.44568 1.375 6 1.375C8.5543 1.375 10.625 3.44568 10.625 6C10.625 8.5543 8.5543 10.625 6 10.625Z" />
      </g>
      <defs>
        <clipPath id={id}>
          <rect width="12" height="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
