import { SvgProps } from '@lib/ui/props'
import { FC } from 'react'

export const SlippageIcon: FC<SvgProps> = props => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12.2042 6.903H9.25249C8.83357 6.903 8.53834 6.48899 8.6723 6.08939L10.0626 1.94236C10.274 1.31182 9.48018 0.838085 9.03212 1.32738L2.89771 8.02634C2.53601 8.42136 2.81431 9.06071 3.34795 9.06071H6.29961C6.71393 9.06071 7.00861 9.46618 6.88327 9.86371L5.55719 14.0684C5.35812 14.6996 6.15286 15.1597 6.59458 14.6689L12.6579 7.93345C13.0146 7.53721 12.7353 6.903 12.2042 6.903Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
)
