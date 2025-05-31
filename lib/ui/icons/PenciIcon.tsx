import { useId } from 'react'

export const PencilIcon = () => {
  const id = useId()

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="none"
    >
      <g clipPath={`url(#${id})`}>
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M10 3.333 12.667 6m1.449-1.459a1.88 1.88 0 0 0-2.657-2.658l-8.898 8.9c-.154.154-.269.344-.333.553l-.88 2.901a.333.333 0 0 0 .415.415l2.902-.88c.208-.064.398-.177.553-.331l8.898-8.9Z"
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
