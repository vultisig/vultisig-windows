import { getColor } from '@lib/ui/theme/getters'
import { match } from '@vultisig/lib-utils/match'
import styled from 'styled-components'

export type ErrorStatusVariant = 'error' | 'warning'

type ErrorStatusIconProps = {
  variant: ErrorStatusVariant
}

/**
 * Concentric-circle hero graphic with a centered status badge, matching the
 * Figma error screen. Renders a red ✕ for hard failures and an amber ⚠ for
 * recoverable / precondition errors.
 */
export const ErrorStatusIcon = ({ variant }: ErrorStatusIconProps) => (
  <Hero>
    <Ring size={262} />
    <Ring size={135} />
    <Ring size={73} />
    <Badge variant={variant} viewBox="0 0 24 24" fill="none">
      <circle className="badge-fill" cx={12} cy={12} r={12} />
      {match(variant, {
        error: () => (
          <>
            <path
              className="badge-stroke"
              strokeWidth={1.5}
              strokeLinecap="square"
              d="M7.76953 7.77148L16.2279 16.2298M16.2279 7.77148L7.76953 16.2298"
            />
            <circle className="badge-stroke" cx={12} cy={12} r={10.5} />
          </>
        ),
        warning: () => (
          <path
            className="badge-stroke"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
          />
        ),
      })}
    </Badge>
  </Hero>
)

const Hero = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`

const Ring = styled.div<{ size: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  transform: translate(-50%, -50%);
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 50%;
  opacity: 0.5;
`

const Badge = styled.svg<{ variant: ErrorStatusVariant }>`
  position: relative;
  width: 24px;
  height: 24px;
  flex-shrink: 0;

  .badge-fill {
    fill: ${({ variant }) => getColor(variant === 'error' ? 'danger' : 'idle')};
  }

  .badge-stroke {
    fill: none;
    stroke: ${getColor('background')};
  }
`
