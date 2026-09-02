import { borderRadius } from '@lib/ui/css/borderRadius'
import { ValueProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import { ThemeColor } from '@lib/ui/theme/ThemeColors'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { TokenVerification } from '@vultisig/core-chain/coin/tokenVerification'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type LabelledVerification = Exclude<TokenVerification, 'verified'>

const pillColor: Record<LabelledVerification, ThemeColor> = {
  unverified: 'textShy',
  scam: 'danger',
}

const isLabelled = (value: TokenVerification): value is LabelledVerification =>
  value !== 'verified'

/**
 * The label for a token's verification tier. A verified token renders nothing:
 * the absence of a label is the signal users are trained on ("real USDT never
 * says Unverified"), so a badge on every legitimate row would only dilute it.
 * The two labelled tiers carry a tooltip that says what the label means.
 */
export const TokenVerificationPill = ({
  value,
}: ValueProp<TokenVerification>) => {
  const { t } = useTranslation()

  if (!isLabelled(value)) return null

  return (
    <Tooltip
      content={t(`token_verification_${value}_hint`)}
      renderOpener={props => (
        <Pill
          {...props}
          $color={pillColor[value]}
          data-testid={`token-verification-${value}`}
        >
          {t(`token_verification_${value}`)}
        </Pill>
      )}
    />
  )
}

const Pill = styled.span<{ $color: ThemeColor }>`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  border: 1px solid ${({ $color }) => getColor($color)};
  ${borderRadius.pill};
  color: ${({ $color }) => getColor($color)};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  line-height: 1;
  padding: 3px 7px;
  white-space: nowrap;
`
