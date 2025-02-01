const InfoGradientIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none">
    <path
      stroke="#9F9F9F"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="M10 17.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z"
    />
    <path
      stroke="url(#a)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="M10 17.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z"
    />
    <path
      stroke="#9F9F9F"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="M9.375 9.375H10v4.375h.625"
    />
    <path
      stroke="url(#b)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="M9.375 9.375H10v4.375h.625"
    />
    <path
      fill="#9F9F9F"
      d="M10 7.5a.937.937 0 1 0 0-1.875.937.937 0 0 0 0 1.875Z"
    />
    <path
      fill="url(#c)"
      d="M10 7.5a.937.937 0 1 0 0-1.875.937.937 0 0 0 0 1.875Z"
    />
    <defs>
      <linearGradient
        id="a"
        x1={4.9}
        x2={27.147}
        y1={2.5}
        y2={7.563}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#33E6BF" />
        <stop offset={1} stopColor="#0439C7" />
      </linearGradient>
      <linearGradient
        id="b"
        x1={9.575}
        x2={11.517}
        y1={9.375}
        y2={9.501}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#33E6BF" />
        <stop offset={1} stopColor="#0439C7" />
      </linearGradient>
      <linearGradient
        id="c"
        x1={9.363}
        x2={12.143}
        y1={5.625}
        y2={6.258}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#33E6BF" />
        <stop offset={1} stopColor="#0439C7" />
      </linearGradient>
    </defs>
  </svg>
);
export default InfoGradientIcon;
