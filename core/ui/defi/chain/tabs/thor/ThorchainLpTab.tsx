import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getCoinLogoSrc } from '@core/ui/chain/coin/icon/utils/getCoinLogoSrc'
import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { useThorLpPositionsQuery } from '@core/ui/defi/chain/thor/hooks'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@lib/utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const runeDecimals = 8

// Map asset names to their logos
const getAssetLogo = (asset: string): string => {
  const assetLower = asset.toLowerCase()
  if (assetLower.includes('eth')) return 'eth'
  if (assetLower.includes('btc')) return 'btc'
  if (assetLower.includes('usdc')) return 'usdc'
  if (assetLower.includes('usdt')) return 'usdt'
  if (assetLower.includes('bnb') || assetLower.includes('bsc')) return 'bsc'
  if (assetLower.includes('avax')) return 'avax'
  return 'eth' // default
}

// Extract pool name from asset string (e.g., "ETH.ETH" -> "ETH")
const getPoolName = (asset: string): string => {
  const parts = asset.split('.')
  return parts.length > 1 ? parts[1] : parts[0]
}

export const ThorchainLpTab = () => {
  const { data, isPending, isError } = useThorLpPositionsQuery()
  const navigate = useCoreNavigate()
  const formatFiatAmount = useFormatFiatAmount()
  const { t } = useTranslation()

  const runeCoin = chainFeeCoin.THORChain
  const pricesQuery = useCoinPricesQuery({
    coins: [
      {
        chain: Chain.THORChain,
        id: runeCoin.id,
        priceProviderId: runeCoin.priceProviderId,
      },
    ],
  })
  const runePrice = pricesQuery.data?.[`${Chain.THORChain}:`] ?? 0

  if (isPending) {
    return (
      <HStack justifyContent="center">
        <Spinner />
      </HStack>
    )
  }

  if (isError) {
    return (
      <Text color="danger" size={14}>
        {t('failed_to_load_lp_positions')}
      </Text>
    )
  }

  const positions = data ?? []

  if (positions.length === 0) {
    return (
      <Panel>
        <Text size={14} color="shy">
          {t('no_lp_positions_found')}
        </Text>
      </Panel>
    )
  }

  return (
    <VStack gap={16}>
      {positions.map(position => {
        const runeValue = BigInt(position.rune_deposit_value ?? '0')
        const assetValue = BigInt(position.asset_deposit_value ?? '0')
        // Total value is approximately 2x RUNE value (symmetric pool)
        const totalUsdValue =
          fromChainAmount(runeValue, runeDecimals) * runePrice * 2
        const poolName = getPoolName(position.asset)
        const assetLogo = getAssetLogo(position.asset)

        return (
          <LpCardPanel key={position.asset}>
            {/* Header with pool icon and APR */}
            <HStack justifyContent="space-between" alignItems="flex-start">
              <HStack gap={12} alignItems="center">
                <PoolIconContainer>
                  <SafeImage
                    src={getCoinLogoSrc(assetLogo)}
                    render={props => <PoolIcon {...props} />}
                    fallback={
                      <PoolIconFallback>{poolName[0]}</PoolIconFallback>
                    }
                  />
                </PoolIconContainer>
                <VStack gap={4}>
                  <Text size={12} color="shy">
                    RUNE/{poolName} Pool
                  </Text>
                  <Text size={20} weight="700" color="contrast">
                    {formatFiatAmount(totalUsdValue)}
                  </Text>
                </VStack>
              </HStack>
              <VStack alignItems="flex-end" gap={4}>
                <HStack gap={4} alignItems="center">
                  <AprIcon>@</AprIcon>
                  <Text size={12} color="shy">
                    APR
                  </Text>
                </HStack>
                <Text size={14} weight="600" color="primary">
                  {position.apr ? `${position.apr.toFixed(2)}%` : '--'}
                </Text>
              </VStack>
            </HStack>

            {/* Position details */}
            <VStack gap={4}>
              <Text size={12} color="shy">
                Position
              </Text>
              <Text size={14} color="contrast">
                {formatAmount(fromChainAmount(runeValue, runeDecimals), {
                  precision: 'high',
                })}{' '}
                RUNE +{' '}
                {formatAmount(fromChainAmount(assetValue, runeDecimals), {
                  precision: 'high',
                })}{' '}
                {poolName}
              </Text>
            </VStack>

            {/* Action buttons */}
            <HStack gap={10}>
              <ActionButton
                onClick={() =>
                  navigate({
                    id: 'deposit',
                    state: { coin: chainFeeCoin.THORChain, action: 'custom' },
                  })
                }
              >
                <ButtonIcon>⊖</ButtonIcon>
                Remove
              </ActionButton>
              <PrimaryActionButton
                onClick={() =>
                  navigate({
                    id: 'deposit',
                    state: { coin: chainFeeCoin.THORChain, action: 'custom' },
                  })
                }
              >
                <ButtonIcon>⊕</ButtonIcon>
                Add
              </PrimaryActionButton>
            </HStack>
          </LpCardPanel>
        )
      })}
    </VStack>
  )
}

const LpCardPanel = styled(Panel)`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const PoolIconContainer = styled.div`
  ${sameDimensions(40)};
  position: relative;
`

const PoolIcon = styled.img`
  ${sameDimensions(40)};
  border-radius: 50%;
`

const PoolIconFallback = styled.div`
  ${sameDimensions(40)};
  border-radius: 50%;
  background: ${getColor('foregroundExtra')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${getColor('primary')};
  font-weight: 700;
`

const AprIcon = styled.span`
  font-size: 10px;
  color: ${getColor('textShy')};
`

const ActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 20px;
  background: transparent;
  color: ${getColor('contrast')};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`

const PrimaryActionButton = styled(ActionButton)`
  background: ${getColor('buttonPrimary')};
  border-color: ${getColor('buttonPrimary')};
`

const ButtonIcon = styled.span`
  font-size: 14px;
`
