import { IconWrapper as IconWrapperBase } from '@lib/ui/icons/IconWrapper'
import { useId } from 'react'
import styled from 'styled-components'

import { getColor } from '../theme/getters'

export const CheckmarkIcon = () => {
  const id = useId()

  return (
    <IconWrapper>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        fill="none"
        viewBox="0 0 12 12"
      >
        <g clipPath={`url(#${id})`}>
          <path
            fill="currentColor"
            d="M5.22 8.743a.67.67 0 0 0 .548-.25L8.86 4.588c.04-.05.078-.106.111-.166.034-.06.051-.12.051-.181 0-.12-.056-.215-.169-.288a.687.687 0 0 0-.379-.108.577.577 0 0 0-.473.244L5.193 7.7 3.86 6.318a.678.678 0 0 0-.24-.176.712.712 0 0 0-.26-.046.555.555 0 0 0-.37.127.387.387 0 0 0-.152.307c0 .112.052.224.156.336l1.65 1.627c.086.087.176.15.268.19.093.04.195.06.308.06Z"
          />
        </g>
        <defs>
          <clipPath id={id}>
            <path fill="currentColor" d="M.333.667h11.244v11.244H.333z" />
          </clipPath>
        </defs>
      </svg>
    </IconWrapper>
  )
}

const IconWrapper = styled(IconWrapperBase)`
  color: ${getColor('primary')};
  border: 1px solid ${getColor('primary')};
  border-radius: 99px;
`
