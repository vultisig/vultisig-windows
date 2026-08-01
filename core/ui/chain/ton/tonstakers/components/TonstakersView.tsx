import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { StakeCard } from '@core/ui/defi/chain/components/stake/StakeCard'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { coinKeyToString, extractCoinKey } from '@vultisig/core-chain/coin/Coin'
import { useTranslation } from 'react-i18next'

import { tonstakersReceiptCoin } from '../core'
import { useTonstakersPositionQuery } from '../queries/useTonstakersPositionQuery'

export const TonstakersView = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const vaultCoins = useCurrentVaultCoins()
  const tonCoin = vaultCoins.find(coin => coin.chain === Chain.Ton && !coin.id)
  const positionQuery = useTonstakersPositionQuery(tonCoin?.address)
  const priceQuery = useCoinPricesQuery({ coins: tonCoin ? [tonCoin] : [] })

  if (!tonCoin) {
    return (
      <Text size={14} color="shy" centerHorizontally>
        {t('ton_stake_chain_not_enabled')}
      </Text>
    )
  }

  const openAction = (action: 'stake' | 'unstake') =>
    navigate({ id: 'tonstakers', state: { action } })

  if (positionQuery.isPending) {
    return (
      <StakeCard
        coin={tonstakersReceiptCoin}
        title={t('tonstakers_liquid_staking')}
        amount={0n}
        fiat={0}
        isSkeleton
      />
    )
  }

  if (positionQuery.error) {
    return (
      <Text size={14} color="danger" centerHorizontally>
        {t('failed_to_load')}
      </Text>
    )
  }

  const position = positionQuery.data
  if (!position) {
    return (
      <VStack gap={16}>
        <VStack gap={8} alignItems="center">
          <Text size={17} weight="600" centerHorizontally>
            {t('tonstakers_empty_title')}
          </Text>
          <Text size={13} color="shy" centerHorizontally>
            {t('tonstakers_empty_description')}
          </Text>
        </VStack>
        <Button kind="primary" onClick={() => openAction('stake')}>
          {t('tonstakers_stake_cta')}
        </Button>
      </VStack>
    )
  }

  const priceUsd =
    priceQuery.data?.[coinKeyToString(extractCoinKey(tonCoin))] ?? 0
  const tsTonUi = Number(
    fromChainAmount(position.jettonBalance, tonstakersReceiptCoin.decimals)
  )
  const fiat = tsTonUi * position.tonPerTsTon * priceUsd

  return (
    <VStack gap={8}>
      <StakeCard
        coin={tonstakersReceiptCoin}
        title={t('tonstakers_liquid_staking')}
        amount={position.jettonBalance}
        fiat={fiat}
        apr={position.apr}
        onStake={() => openAction('stake')}
        onUnstake={() => openAction('unstake')}
        infoUrl="https://tonstakers.com"
      />
      <Text size={12} color="shy">
        {t('tonstakers_position_rate', {
          rate: position.tonPerTsTon.toFixed(4),
        })}
      </Text>
    </VStack>
  )
}
