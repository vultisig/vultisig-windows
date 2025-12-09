import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { coinKeyToString } from '@core/chain/coin/Coin'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { useDefiPositions } from '@core/ui/storage/defiPositions'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { Image } from '@lib/ui/image/Image'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { useTranslation } from 'react-i18next'

import { useDefiChainPositionsQuery } from '../queries/useDefiChainPositionsQuery'
import { aggregateDefiPositions } from '../services/defiPositionAggregator'
import { BannerContainer, BannerContent, ThorchainLogoWrapper } from './shared'

export const DefiThorchainBalanceBanner = () => {
  const { t } = useTranslation()
  const chain = Chain.THORChain
  const selectedPositions = useDefiPositions(chain)
  const formatFiatAmount = useFormatFiatAmount()
  const positionsQuery = useDefiChainPositionsQuery(chain)

  let totalFiat = 0
  let runeEquivalent: number | undefined

  const isLoading = positionsQuery.isPending

  if (positionsQuery.data) {
    const aggregates = aggregateDefiPositions({
      chain,
      selectedPositionIds: selectedPositions,
      thorchain: positionsQuery.data,
    })
    totalFiat = aggregates.totalFiat
    const rune = chainFeeCoin[Chain.THORChain]
    const runePrice = positionsQuery.data.prices[coinKeyToString(rune)] ?? 0
    runeEquivalent = runePrice > 0 ? totalFiat / runePrice : undefined
  }

  return (
    <BannerContainer>
      <ThorchainLogoWrapper>
        <Image
          src="/core/images/referrals-thorchain-logo.png"
          width="100%"
          height="100%"
        />
      </ThorchainLogoWrapper>
      <BannerContent gap={8}>
        <Text size={18} color="contrast">
          {chain}
        </Text>
        <VStack gap={4}>
          {isLoading ? (
            <Spinner size={20} />
          ) : (
            <Text size={28} weight="700" color="contrast">
              <BalanceVisibilityAware>
                {formatFiatAmount(totalFiat)}
              </BalanceVisibilityAware>
            </Text>
          )}
          {!isLoading && runeEquivalent !== undefined ? (
            <Text size={12}>
              {formatAmount(runeEquivalent, {
                ticker: chainFeeCoin[Chain.THORChain].ticker,
              })}{' '}
              {t('locked_in_defi')}
            </Text>
          ) : null}
        </VStack>
      </BannerContent>
    </BannerContainer>
  )
}
