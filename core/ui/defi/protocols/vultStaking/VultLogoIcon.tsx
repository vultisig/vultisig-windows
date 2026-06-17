import { SvgProps } from '@lib/ui/props'
import { useId } from 'react'

/** VULT brand badge (gradient circle + three-prong glyph). Size via `fontSize`. */
export const VultLogoIcon = (props: SvgProps) => {
  const id = useId()
  const innerShadow = `${id}-inner-shadow`
  const circleFill = `${id}-circle`
  const glyphFill = `${id}-glyph`

  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 102 101"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g filter={`url(#${innerShadow})`}>
        <circle cx="51.007" cy="50.7028" r="50.0944" fill="#D9D9D9" />
        <circle
          cx="51.007"
          cy="50.7028"
          r="50.0944"
          fill={`url(#${circleFill})`}
        />
      </g>
      <path
        d="M49.7321 56.0516L24.4959 70.8074L20.7881 67.062L42.9111 52.0453L49.7321 56.0516Z"
        fill={`url(#${glyphFill})`}
      />
      <path
        d="M50.3026 57.0497L25.0342 71.7493L26.3913 76.8657L50.3267 65.02L50.3026 57.0497Z"
        fill={`url(#${glyphFill})`}
      />
      <path
        d="M51.3057 57.0496L76.5741 71.7492L75.217 76.8657L51.2816 65.02L51.3057 57.0496Z"
        fill={`url(#${glyphFill})`}
      />
      <path
        d="M51.8762 56.0516L77.1124 70.8074L80.8202 67.0619L58.6972 52.0453L51.8762 56.0516Z"
        fill={`url(#${glyphFill})`}
      />
      <path
        d="M51.3058 54.9612L51.2737 25.5057L56.3385 24.1348L58.1509 50.9971L51.3058 54.9612Z"
        fill={`url(#${glyphFill})`}
      />
      <path
        d="M50.1649 54.9612L50.1971 25.5057L45.1322 24.1348L43.3198 50.9971L50.1649 54.9612Z"
        fill={`url(#${glyphFill})`}
      />
      <defs>
        <filter
          id={innerShadow}
          x="0.912598"
          y="0.608398"
          width="100.189"
          height="101.754"
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
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1.56596" />
          <feGaussianBlur stdDeviation="0.782979" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"
          />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
        </filter>
        <linearGradient
          id={circleFill}
          x1="51.007"
          y1="0.608398"
          x2="51.007"
          y2="100.797"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4879FD" />
          <stop offset="1" stopColor="#0D39B1" />
        </linearGradient>
        <linearGradient
          id={glyphFill}
          x1="112.307"
          y1="24.1348"
          x2="126.355"
          y2="131.214"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
