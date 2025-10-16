import { SvgProps } from '@lib/ui/props'

export const BronzeTierIcon = (props: SvgProps) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x="0.5"
      y="0.5"
      width="39"
      height="39"
      rx="19.5"
      fill="#DB5727"
      fillOpacity="0.12"
    />
    <rect x="0.5" y="0.5" width="39" height="39" rx="19.5" stroke="#DB5727" />
    <g clipPath="url(#clip0_51817_156405)">
      <path
        d="M18.8365 10.5785C32.0891 9.09886 33.4296 29.0167 20.3795 29.493C8.16555 29.938 6.84811 11.9186 18.8365 10.5785ZM21.4235 12.4124C20.7541 12.5153 19.6923 13.0213 19.1526 13.4349C17.8475 14.4347 14.522 17.7378 13.4673 19.0255C9.40133 23.9827 15.9264 30.5399 21.1749 26.3138C22.3734 25.3489 26.743 21.067 27.2934 19.8752C29.1346 15.8882 25.809 11.7406 21.4235 12.4124Z"
        fill="#FF6333"
      />
    </g>
    <defs>
      <clipPath id="clip0_51817_156405">
        <rect
          width="19"
          height="19"
          fill="white"
          transform="translate(10.5 10.5)"
        />
      </clipPath>
    </defs>
  </svg>
)
