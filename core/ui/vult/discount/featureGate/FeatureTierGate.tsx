import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { WalletIcon } from '@lib/ui/icons/WalletIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { extractCoinKey } from '@vultisig/core-chain/coin/Coin'
import { vult } from '@vultisig/core-chain/coin/knownTokens'
import {
  VultDiscountTier,
  vultDiscountTierMinBalances,
} from '@vultisig/core-chain/swap/affiliate/config'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { useCreateCoinMutation } from '../../../storage/coins'
import { useVultBalanceQuery } from '../queries/balance'
import { discountTierColors } from '../tier/colors'
import { discountTierGradients } from '../tier/container'
import { discountTierIcons } from '../tier/icons'

type FeatureTierGateProps = {
  isOpen: boolean
  onClose: () => void
  /** Icon for the gated feature, rendered inside the header badge. */
  icon: ReactNode
  /** Name of the gated feature. */
  title: string
  /** Short explanation of the gated feature. */
  description: string
  /** Minimum tier (and VULT threshold) the feature requires. */
  requiredTier: VultDiscountTier
}

/**
 * Reusable bottom-sheet shown when a tier-locked feature is tapped without the
 * required VULT tier. Parameterised by the gated feature (icon/title/description)
 * and the required tier; shows the threshold, the vault's VULT balance, and a
 * "Get $VULT" CTA that routes to the swap with VULT preselected.
 */
export const FeatureTierGate = ({
  isOpen,
  onClose,
  icon,
  title,
  description,
  requiredTier,
}: FeatureTierGateProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { mutate: createCoin, isPending } = useCreateCoinMutation()
  const balanceQuery = useVultBalanceQuery()

  const TierIcon = discountTierIcons[requiredTier]
  const accent = discountTierColors[requiredTier].toCssValue()

  return (
    <ResponsiveModal isOpen={isOpen} onClose={onClose} grabbable>
      <VStack alignItems="center" gap={20} padding="8px 16px 16px">
        <VStack alignItems="center" gap={32} fullWidth>
          <IconBadge>{icon}</IconBadge>
          <VStack alignItems="center" gap={16}>
            <Text size={22} weight={500} centerHorizontally>
              {title}
            </Text>
            <Text
              size={14}
              weight={500}
              color="shy"
              centerHorizontally
              height="large"
            >
              {description}
            </Text>
          </VStack>
        </VStack>
        <FooterGroup>
          <RequirementCard>
            <Text size={13} weight={500} color="shy">
              {t('feature_gate_requires')}
            </Text>
            <HStack alignItems="center" gap={12}>
              <TierIcon fontSize={36} />
              <VStack gap={2}>
                <Text size={14} weight={500}>
                  {t('feature_gate_requires_tier', { tier: t(requiredTier) })}
                </Text>
                <Text size={13} weight={500} color="shy">
                  {t('feature_gate_hold_at_least', {
                    amount: formatAmount(
                      vultDiscountTierMinBalances[requiredTier],
                      { ticker: vult.ticker }
                    ),
                  })}
                </Text>
              </VStack>
            </HStack>
            <BalanceRow>
              <HStack alignItems="center" gap={6}>
                <IconWrapper>
                  <WalletIcon />
                </IconWrapper>
                <Text size={13} weight={500} color="shy">
                  {t('feature_gate_your_balance')}
                </Text>
              </HStack>
              <Text size={13} weight={500} style={{ color: accent }}>
                {formatAmount(balanceQuery.data ?? 0, { ticker: vult.ticker })}
              </Text>
            </BalanceRow>
          </RequirementCard>
          <GetVultButton
            $gradient={discountTierGradients[requiredTier]}
            disabled={isPending}
            onClick={() =>
              createCoin(vult, {
                onSuccess: coin => {
                  navigate({
                    id: 'swap',
                    state: { toCoin: extractCoinKey(coin) },
                  })
                },
              })
            }
          >
            {isPending ? <Spinner /> : t('get_vult')}
          </GetVultButton>
        </FooterGroup>
      </VStack>
    </ResponsiveModal>
  )
}

const IconBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #03132c;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  font-size: 20px;
  color: #0439c7;
`

const IconWrapper = styled.div`
  display: inline-flex;
  font-size: 16px;
  color: ${getColor('textShy')};
`

const FooterGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-self: stretch;
`

const RequirementCard = styled(VStack)`
  position: relative;
  z-index: 1;
  align-self: stretch;
  gap: 12px;
  padding: 24px 20px 16px;
  border-radius: 24px 24px 20px 20px;
  background: ${getColor('foreground')};
  border: 1px solid #11284a;
`

const BalanceRow = styled(HStack)`
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 14px;
  background: #0d2240;
  border: 1px solid #11284a;
`

const GetVultButton = styled(UnstyledButton)<{ $gradient: string }>`
  position: relative;
  z-index: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  align-self: stretch;
  margin-top: -22px;
  padding: 32px 32px 14px;
  border-radius: 0 0 24px 24px;
  background: ${({ $gradient }) => $gradient};
  color: #f0f4fc;
  font-size: 14px;
  font-weight: 600;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`
