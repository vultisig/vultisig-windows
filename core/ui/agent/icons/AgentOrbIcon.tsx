import styled from 'styled-components'

export const AgentOrbIcon = () => (
  <OrbWrapper>
    <OrbSvg
      width="87"
      height="99"
      viewBox="0 0 87 99"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_dddii_orb)">
        <circle cx="43.35" cy="36.45" r="25" fill="url(#paint0_radial_orb)" />
      </g>
      <defs>
        <filter
          id="filter0_dddii_orb"
          x="-0.00003"
          y="-0.00005"
          width="86.7"
          height="98.3"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="3.525" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.280972 0 0 0 0 0.475478 0 0 0 0 0.991667 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="9.5" />
          <feGaussianBlur stdDeviation="6" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.570673 0 0 0 0 0.322115 0 0 0 0 1 0 0 0 0.6 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow"
            result="effect2_dropShadow"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="18.5" />
          <feGaussianBlur stdDeviation="9.175" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.129412 0 0 0 0 0.333333 0 0 0 0 0.87451 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="effect2_dropShadow"
            result="effect3_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect3_dropShadow"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-3.5" />
          <feGaussianBlur stdDeviation="2.075" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.172549 0 0 0 0 1 0 0 0 0 0.988235 0 0 0 1 0"
          />
          <feBlend mode="normal" in2="shape" result="effect4_innerShadow" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-7" />
          <feGaussianBlur stdDeviation="2.975" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.8125 0 0 0 0 0.567308 0 0 0 0 1 0 0 0 0.45 0"
          />
          <feBlend
            mode="normal"
            in2="effect4_innerShadow"
            result="effect5_innerShadow"
          />
        </filter>
        <radialGradient
          id="paint0_radial_orb"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(43.35 22.2) rotate(90) scale(39.25 65.3306)"
        >
          <stop stopColor="#11284A" />
          <stop offset="0.273885" stopColor="#143472" />
          <stop offset="0.656051" stopColor="#0B4EFF" />
          <stop offset="1" stopColor="#2CFFFC" />
        </radialGradient>
      </defs>
    </OrbSvg>
  </OrbWrapper>
)

const OrbWrapper = styled.div`
  position: relative;
  width: 87px;
  height: 50px;
  flex-shrink: 0;
  overflow: visible;

  &::after {
    content: '';
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    width: 160px;
    height: 100px;
    background: radial-gradient(
      ellipse 55% 50% at 50% 22%,
      hsla(224, 100%, 60%, 0.55) 0%,
      hsla(230, 100%, 52%, 0.2) 40%,
      hsla(240, 100%, 42%, 0.05) 70%,
      transparent 100%
    );
    filter: blur(16px);
    pointer-events: none;
  }
`

const OrbSvg = styled.svg`
  position: absolute;
  top: -11px;
  left: 0;
  overflow: visible;
  z-index: 1;
`
