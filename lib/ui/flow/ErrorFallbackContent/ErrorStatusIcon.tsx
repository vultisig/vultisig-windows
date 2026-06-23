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
    <Badge variant={variant}>
      {match(variant, {
        error: () => (
          <Glyph
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 8L8 16M8 8l8 8" />
          </Glyph>
        ),
        warning: () => (
          <Glyph
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 7v6M12 16.5h.01" />
          </Glyph>
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
  width: 262px;
  height: 262px;
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
`

const Badge = styled.div<{ variant: ErrorStatusVariant }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  box-shadow: 0 0 0 2px ${getColor('background')};
  background: ${({ variant }) =>
    getColor(variant === 'error' ? 'danger' : 'idle')};
  color: ${getColor('background')};
`

const Glyph = styled.svg`
  width: 14px;
  height: 14px;
`
