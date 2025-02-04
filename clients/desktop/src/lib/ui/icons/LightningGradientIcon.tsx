export const LightningGradientIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
  >
    <g clipPath="url(#a)">
      <path
        stroke="url(#b)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13.75 3v7h6l-8 11v-7h-6l8-11Z"
      />
    </g>
    <defs>
      <linearGradient
        id="b"
        x1={3.382}
        x2={23.959}
        y1={-8.432}
        y2={-10.643}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0.023} stopColor="#33E6BF" />
        <stop offset={0.986} stopColor="#0439C7" />
      </linearGradient>
      <clipPath id="a">
        <path fill="#fff" d="M.75 0h24v24h-24z" />
      </clipPath>
    </defs>
  </svg>
);
