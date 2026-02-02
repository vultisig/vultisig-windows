import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const ArCubeIcon: FC<SvgProps> = props => (
  <svg
    fill="none"
    height="1em"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path d="M12.0002 12V20.5M12.0002 12L4.5 7.78123M12.0002 12L19.2627 7.91472M20.25 8.52905V15.4709C20.25 16.1935 19.8603 16.8598 19.2305 17.2141L12.9805 20.7297C12.3717 21.0722 11.6283 21.0722 11.0195 20.7297L4.76948 17.2141C4.13972 16.8598 3.75 16.1935 3.75 15.4709V8.52905C3.75 7.80651 4.13972 7.14014 4.76948 6.7859L11.0195 3.27028C11.6283 2.92781 12.3717 2.92781 12.9805 3.27028L19.2305 6.7859C19.8603 7.14014 20.25 7.80651 20.25 8.52905Z" />
  </svg>
)
