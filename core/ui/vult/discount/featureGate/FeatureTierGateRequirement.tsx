import { borderRadius, borderRadiusPx } from '@lib/ui/css/borderRadius'
import { WalletIcon } from '@lib/ui/icons/WalletIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { vult } from '@vultisig/core-chain/coin/knownTokens'
import {
  VultDiscountTier,
  vultDiscountTierMinBalances,
} from '@vultisig/core-chain/swap/affiliate/config'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { discountTierColors } from '../tier/colors'
import { discountTierIcons } from '../tier/icons'
import { featureTierGateLooks } from './featureTierGateLooks'

type FeatureTierGateRequirementProps = {
  requiredTier: VultDiscountTier
  balance: number
  isSettingsLook: boolean
}

/** The tier a gated feature requires, its VULT threshold and the vault's balance. */
export const FeatureTierGateRequirement = ({
  requiredTier,
  balance,
  isSettingsLook,
}: FeatureTierGateRequirementProps) => {
  const { t } = useTranslation()
  const look = featureTierGateLooks[isSettingsLook ? 'settings' : 'default']
  const TierIcon = discountTierIcons[requiredTier]
  const accent = discountTierColors[requiredTier].toCssValue()

  return (
    <RequirementCard $isSettingsLook={isSettingsLook}>
      <look.Label color="shy" {...look.footnote}>
        {t('feature_gate_requires')}
      </look.Label>
      <HStack alignItems="center" gap={12}>
        <TierIcon fontSize={36} style={look.tierIconStyle} />
        <VStack gap={2} padding={look.tierNamePadding}>
          <look.Label {...look.tierName}>
            {t('feature_gate_requires_tier', {
              tier: t(requiredTier),
            })}
          </look.Label>
          <look.Label color="shy" {...look.footnote}>
            {t('feature_gate_hold_at_least', {
              amount: formatAmount(vultDiscountTierMinBalances[requiredTier], {
                ticker: vult.ticker,
              }),
            })}
          </look.Label>
        </VStack>
      </HStack>
      <BalanceRow $isSettingsLook={isSettingsLook}>
        <HStack alignItems="center" gap={6}>
          <IconWrapper>
            <WalletIcon />
          </IconWrapper>
          <look.Label color="shy" {...look.footnote}>
            {t('feature_gate_your_balance')}
          </look.Label>
        </HStack>
        <look.Label {...look.footnote} style={{ color: accent }}>
          {formatAmount(balance, {
            ticker: vult.ticker,
          })}
        </look.Label>
      </BalanceRow>
    </RequirementCard>
  )
}

const IconWrapper = styled.div`
  display: inline-flex;
  font-size: 16px;
  color: ${getColor('textShy')};
`

const RequirementCard = styled(VStack)<{ $isSettingsLook: boolean }>`
  position: relative;
  z-index: 1;
  align-self: stretch;
  gap: 12px;
  padding: 24px 20px 16px;
  ${borderRadius.xl};
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};

  ${({ $isSettingsLook }) =>
    $isSettingsLook &&
    css`
      border-radius: ${borderRadiusPx.xl}px ${borderRadiusPx.xl}px 20px 20px;
      padding: 23px 19px 15px;
    `}
`

// eslint-disable-next-line local/no-hardcoded-border-radius -- the sheet component's own radius, off the scale
const BalanceRow = styled(HStack)<{ $isSettingsLook: boolean }>`
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  gap: 12px;
  padding: 16px;
  ${borderRadius.lg};
  background: #0d2240;
  border: 1px solid ${getColor('foregroundExtra')};

  > * {
    min-width: 0;
  }

  ${({ $isSettingsLook }) =>
    $isSettingsLook &&
    css`
      background: ${getColor('settingsRaisedSurface')};
      border-radius: 14px;
      margin-top: 12px;
      padding: 15px;
    `}
`
