import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

// eslint-disable-next-line local/no-hardcoded-border-radius -- the app icon's own corner
const Tile = styled.div`
  align-items: center;
  background: linear-gradient(180deg, #4879fd 0%, #0d39b1 100%);
  border-radius: 23.84px;
  box-shadow: inset 0 1.49px 1.49px 0 rgba(255, 255, 255, 0.35);
  color: ${getColor('white')};
  display: flex;
  flex-shrink: 0;
  height: 74.5px;
  justify-content: center;
  width: 74.5px;
`

const gradientId = 'update-logo-tile-mark'

/** The app icon of the Check for Updates page. */
export const UpdateLogoTile = () => (
  <Tile>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="41.8158"
      height="41.72"
      viewBox="0 0 41.8158 41.72"
      fill="none"
      aria-hidden
    >
      <path
        d="M20.1612 24.3921L2.58269 34.5669L0 31.9842L15.41 21.6296L20.1612 24.3921Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M20.5585 25.0803L2.95764 35.2163L3.90295 38.7443L20.5753 30.5762L20.5585 25.0803Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M21.2573 25.0803L38.8582 35.2163L37.9129 38.7443L21.2405 30.5762L21.2573 25.0803Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M21.6546 24.3921L39.2332 34.5669L41.8158 31.9842L26.4059 21.6296L21.6546 24.3921Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M21.2573 23.6402L21.235 3.32934L24.7629 2.384L26.0253 20.9068L21.2573 23.6402Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M20.4627 23.6402L20.485 3.32934L16.9571 2.384L15.6947 20.9068L20.4627 23.6402Z"
        fill={`url(#${gradientId})`}
      />
      <defs>
        <linearGradient
          id={gradientId}
          x1="63.7481"
          y1="2.384"
          x2="73.341"
          y2="76.2451"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  </Tile>
)
