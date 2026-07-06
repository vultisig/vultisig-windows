import { SvgProps } from '@lib/ui/props'

/**
 * Subtle blurred radial glow sitting behind the Reshare landing content
 * (Figma "Ellipse 8", node 326:78653). Purely decorative — render it as an
 * absolutely-positioned background layer with `pointer-events: none`.
 */
export const ReshareGlow = (props: SvgProps) => (
  <svg
    width="393"
    height="560"
    viewBox="0 0 393 560"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g opacity="0.5" filter="url(#reshare_glow_blur)">
      <path
        d="M377 280C377 379.411 296.411 460 197 460C97.5887 460 17 379.411 17 280C17 180.589 97.5887 100 197 100C296.411 100 377 180.589 377 280Z"
        fill="url(#reshare_glow_gradient)"
        fillOpacity="0.15"
      />
    </g>
    <defs>
      <filter
        id="reshare_glow_blur"
        x="-83"
        y="0"
        width="560"
        height="560"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="BackgroundImageFix"
          result="shape"
        />
        <feGaussianBlur
          stdDeviation="50"
          result="effect1_foregroundBlur_326_78653"
        />
      </filter>
      <linearGradient
        id="reshare_glow_gradient"
        x1="-43.8994"
        y1="-128.634"
        x2="481.32"
        y2="-201.213"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.023206" stopColor="#4879FD" />
        <stop offset="0.985682" stopColor="#0439C7" />
      </linearGradient>
    </defs>
  </svg>
)
