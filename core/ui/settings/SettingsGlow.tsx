import styled from 'styled-components'

type SettingsGlowProps = {
  /** Distance of the glow's center from the middle of the page. */
  centerOffset?: number
}

/** The soft teal ellipse behind the settings empty and status screens. */
export const SettingsGlow = ({ centerOffset = 0 }: SettingsGlowProps) => (
  <Clip aria-hidden>
    <Ellipse style={{ top: `calc(50% + ${centerOffset}px)` }} />
  </Clip>
)

const Clip = styled.div`
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
`

// eslint-disable-next-line local/no-hardcoded-border-radius -- a decorative glow, not a surface
const Ellipse = styled.div`
  background: linear-gradient(
    82deg,
    rgba(51, 230, 191, 0.15) 8.02%,
    rgba(4, 57, 199, 0.15) 133.75%
  );
  border-radius: 50%;
  filter: blur(126.945px);
  height: 416px;
  left: 50%;
  position: absolute;
  transform: translate(-50%, -50%);
  width: 374px;
`
