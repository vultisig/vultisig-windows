import { Chain } from '@core/chain/Chain'
import {
  sunToTrx,
  TronAccountResources,
} from '@core/chain/chains/tron/resources'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { Button } from '@lib/ui/buttons/Button'
import { SeparatedByLine } from '@lib/ui/layout/SeparatedByLine'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

type ActionsCardProps = {
  data: TronAccountResources
}

export const ActionsCard = ({ data }: ActionsCardProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const formatFiatAmount = useFormatFiatAmount()
  const address = useCurrentVaultAddress(Chain.Tron)
  const balanceQuery = useBalanceQuery({
    chain: Chain.Tron,
    address,
    id: undefined,
  })
  const priceQuery = useCoinPriceQuery({
    coin: { chain: Chain.Tron, id: undefined },
  })
  const hasAvailableBalance =
    balanceQuery.data != null && balanceQuery.data > BigInt(0)

  const totalFrozenSun =
    data.frozenForBandwidthSun +
    data.frozenForEnergySun +
    data.unfreezingEntries.reduce(
      (sum, e) => sum + e.unfreezeAmountSun,
      BigInt(0)
    )
  const totalFrozenTrx = sunToTrx(totalFrozenSun)

  const frozenFiat =
    priceQuery.data != null ? totalFrozenTrx * priceQuery.data : undefined

  return (
    <Panel>
      <SeparatedByLine gap={12}>
        <HStack fullWidth alignItems="center" gap={12}>
          <VStack gap={4}>
            <Text color="shy" size={13} weight="500">
              {t('tron_freeze_title')}
            </Text>
            <BalanceVisibilityAware>
              <Text color="contrast" weight="700" size={16}>
                {frozenFiat != null ? formatFiatAmount(frozenFiat) : '-'}
              </Text>
            </BalanceVisibilityAware>
          </VStack>
        </HStack>

        <VStack gap={8}>
          <Text color="shy" size={12}>
            {t('tron_frozen_label')}
          </Text>
          <BalanceVisibilityAware>
            <Text color="contrast" weight="600" size={16}>
              {totalFrozenTrx.toFixed(2)} TRX
            </Text>
          </BalanceVisibilityAware>
        </VStack>

        <HStack fullWidth gap={12}>
          <Button
            kind="outlined"
            disabled={totalFrozenSun <= BigInt(0)}
            onClick={() =>
              navigate({
                id: 'deposit',
                state: {
                  coin: { chain: Chain.Tron },
                  action: 'unfreeze',
                },
              })
            }
            style={{ flex: 1 }}
          >
            {t('unfreeze')}
          </Button>
          <Button
            disabled={!hasAvailableBalance}
            onClick={() =>
              navigate({
                id: 'deposit',
                state: {
                  coin: { chain: Chain.Tron },
                  action: 'freeze',
                },
              })
            }
            style={{ flex: 1 }}
          >
            {t('freeze')}
          </Button>
        </HStack>
      </SeparatedByLine>
    </Panel>
  )
}
