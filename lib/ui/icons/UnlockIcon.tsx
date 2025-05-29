import { FC } from 'react'

import { SvgProps } from '../props'

export const UnlockIcon: FC<SvgProps> = ({ ...props }) => (
  <svg
    width="0.89em"
    height="1em"
    viewBox="0 0 17 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4.33334 8.66631V5.33297C4.3323 4.29968 4.71524 3.30286 5.40781 2.53603C6.10039 1.7692 7.05319 1.28706 8.08126 1.18321C9.10932 1.07937 10.1393 1.36123 10.9712 1.97407C11.8032 2.58691 12.3777 3.48701 12.5833 4.49964M2.66667 8.66638H14.3333C15.2538 8.66638 16 9.41257 16 10.333V16.1664C16 17.0869 15.2538 17.833 14.3333 17.833H2.66667C1.74619 17.833 1 17.0869 1 16.1664V10.333C1 9.41257 1.74619 8.66638 2.66667 8.66638Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
