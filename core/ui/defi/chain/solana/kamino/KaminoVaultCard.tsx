import { getCoinLogoSrc } from '@core/ui/chain/coin/icon/utils/getCoinLogoSrc'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { KaminoVaultInfo } from '@vultisig/core-chain/chains/solana/kamino/models'
import { KaminoRiskTier } from '@vultisig/core-chain/chains/solana/kamino/registry'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type KaminoVaultCardProps = {
  info: KaminoVaultInfo
  /** The vault's underlying coin, for the logo and the fiat conversion. */
  coin: Coin
  /** USD price of the underlying token, `0` when it could not be read. */
  priceUsd: number
  /** The position's value in the underlying token, `0` when none is held. */
  tokenAmount: number
  /** Lifetime PnL in the underlying token, `undefined` when unreadable. */
  pnlToken?: number
}

/**
 * The risk tier is curation, not API data — Kamino exposes no risk field — so
 * the label comes from the registry's tier and is deliberately never phrased
 * as government-backed: the private-credit vault lends against tokenized
 * reinsurance, receivables and corporate bonds.
 */
const riskTierLabelKey = {
  conservative: 'kamino_earn_risk_conservative',
  privateCredit: 'kamino_earn_risk_private_credit',
} as const satisfies Record<KaminoRiskTier, string>

const riskTierColor = {
  conservative: 'success',
  privateCredit: 'idle',
} as const satisfies Record<KaminoRiskTier, string>

/**
 * One curated Kamino Earn vault on the Solana DeFi tab: the vault's live name
 * and its curator, the risk tier it is offered under, the 30-day APY, and —
 * when the vault holds one — the position's balance, fiat value and lifetime
 * PnL.
 */
export const KaminoVaultCard = ({
  info,
  coin,
  priceUsd,
  tokenAmount,
  pnlToken,
}: KaminoVaultCardProps) => {
  const { t } = useTranslation()
  const formatFiatAmount = useFormatFiatAmount()
  const { riskTier, curator } = info.descriptor
  const hasPosition = tokenAmount > 0

  return (
    <Container gap={12}>
      <HStack justifyContent="space-between" alignItems="center" gap={8}>
        <HStack gap={8} alignItems="center">
          <SafeImage
            src={coin.logo ? getCoinLogoSrc(coin.logo) : undefined}
            render={props => <VaultLogo {...props} />}
          />
          <VStack gap={2}>
            <Text weight={500}>{info.name}</Text>
            <Text size={12} color="shy">
              {t('kamino_earn_curated_by', { curator })}
            </Text>
          </VStack>
        </HStack>
        <RiskBadge color={riskTierColor[riskTier]} size={12}>
          {t(riskTierLabelKey[riskTier])}
        </RiskBadge>
      </HStack>

      <HStack justifyContent="space-between" alignItems="center">
        <Text size={13} color="shy">
          {t('kamino_earn_apy_30d')}
        </Text>
        <Text size={13} color="success">
          {`${(info.apy30d * 100).toFixed(2)}%`}
        </Text>
      </HStack>

      {hasPosition ? (
        <>
          <HStack justifyContent="space-between" alignItems="center">
            <Text size={13} color="shy">
              {t('kamino_earn_balance')}
            </Text>
            <VStack alignItems="flex-end" gap={2}>
              <Text weight={500}>
                {formatAmount(tokenAmount, { ticker: coin.ticker })}
              </Text>
              {priceUsd > 0 ? (
                <Text size={13} color="shy">
                  {formatFiatAmount(tokenAmount * priceUsd)}
                </Text>
              ) : null}
            </VStack>
          </HStack>

          {pnlToken !== undefined ? (
            <HStack justifyContent="space-between" alignItems="center">
              <Text size={13} color="shy">
                {t('kamino_earn_pnl')}
              </Text>
              <Text size={13} color={pnlToken < 0 ? 'danger' : 'success'}>
                {`${pnlToken < 0 ? '' : '+'}${formatAmount(pnlToken, {
                  ticker: coin.ticker,
                })}`}
              </Text>
            </HStack>
          ) : null}
        </>
      ) : (
        <Text size={12} color="shy">
          {t('kamino_earn_no_position')}
        </Text>
      )}
    </Container>
  )
}

const Container = styled(VStack)`
  padding: 16px;
  ${borderRadius.xl};
  background: rgba(255, 255, 255, 0.04);
`

const VaultLogo = styled.img`
  width: 36px;
  height: 36px;
  ${borderRadius.pill};
`

const RiskBadge = styled(Text)`
  padding: 4px 8px;
  ${borderRadius.sm};
  background: ${getColor('foreground')};
`
