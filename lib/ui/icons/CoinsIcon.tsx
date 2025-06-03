import { useId } from 'react'

export const CoinsIcon = () => {
  const id = useId()

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      fill="none"
    >
      <g clipPath={`url(#${id})`}>
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12.06 6.913A4 4 0 1 1 6.894 12M4.667 4h.667v2.666m5.806 2.587.467.473-1.88 1.88m-.393-6.273a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
        />
      </g>
      <defs>
        <clipPath id={id}>
          <path fill="currentColor" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}
