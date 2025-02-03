export const LoadingIndicatorImage = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    fill="none"
  >
    <path fill="#fff" fillOpacity={0.15} d="M8 97h233v2H8z" />
    <g filter="url(#a)">
      <rect
        width={58.462}
        height={100}
        x={151.539}
        y={48}
        fill="url(#b)"
        fillOpacity={0.15}
        rx={29.231}
      />
    </g>
    <path fill="url(#c)" d="M8 97h202v2H8z" />
    <g filter="url(#d)">
      <path fill="url(#e)" fillOpacity={0.5} d="M160.77 96H210v4h-49.23v-4Z" />
    </g>
    <g filter="url(#f)">
      <path fill="url(#g)" fillOpacity={0.8} d="M8 93h202v10H8z" />
    </g>
    <path
      fill="url(#h)"
      fillOpacity={0.7}
      d="M8 97h202v2H8z"
      style={{
        mixBlendMode: 'overlay',
      }}
    />
    <g
      filter="url(#i)"
      style={{
        mixBlendMode: 'overlay',
      }}
    >
      <rect
        width={17.231}
        height={56}
        x={193}
        y={69}
        fill="#fff"
        fillOpacity={0.5}
        rx={8.615}
      />
    </g>
    <defs>
      <linearGradient
        id="b"
        x1={210.001}
        x2={151.539}
        y1={147.946}
        y2={147.946}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#34E6BF" />
        <stop offset={1} stopOpacity={0} />
      </linearGradient>
      <linearGradient
        id="c"
        x1={210}
        x2={8}
        y1={99.001}
        y2={99.001}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#34E6BF" />
        <stop offset={0.333} stopColor="#377CDD" />
        <stop offset={0.667} stopColor="#294772" />
        <stop offset={1} stopColor="#002258" />
      </linearGradient>
      <linearGradient
        id="e"
        x1={209.486}
        x2={160.77}
        y1={98}
        y2={98}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#6CE9ED" />
        <stop offset={1} stopOpacity={0} />
      </linearGradient>
      <linearGradient
        id="g"
        x1={210}
        x2={8}
        y1={102.995}
        y2={102.995}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#008366" />
        <stop offset={1} stopOpacity={0} />
      </linearGradient>
      <linearGradient
        id="h"
        x1={210}
        x2={8}
        y1={99.001}
        y2={99.001}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#fff" />
        <stop offset={0.604} stopColor="#fff" stopOpacity={0.74} />
        <stop offset={1} stopColor="#fff" stopOpacity={0} />
      </linearGradient>
      <filter
        id="a"
        width={154.461}
        height={196}
        x={103.539}
        y={0}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur
          result="effect1_foregroundBlur_26558_39982"
          stdDeviation={24}
        />
      </filter>
      <filter
        id="d"
        width={59.23}
        height={14}
        x={155.77}
        y={91}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur
          result="effect1_foregroundBlur_26558_39982"
          stdDeviation={2.5}
        />
      </filter>
      <filter
        id="f"
        width={218}
        height={26}
        x={0}
        y={85}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur
          result="effect1_foregroundBlur_26558_39982"
          stdDeviation={4}
        />
      </filter>
      <filter
        id="i"
        width={113.23}
        height={152}
        x={145}
        y={21}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur
          result="effect1_foregroundBlur_26558_39982"
          stdDeviation={24}
        />
      </filter>
    </defs>
  </svg>
);
