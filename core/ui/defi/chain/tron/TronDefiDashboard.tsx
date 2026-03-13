import { Chain } from '@core/chain/Chain'
import {
  formatTronWithdrawalTime,
  sunToTrx,
} from '@core/chain/chains/tron/resources'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { extractCoinKey } from '@core/chain/coin/Coin'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { TronResourcesSection } from '@core/ui/vault/chain/tron/TronResourcesSection'
import { useTronAccountResourcesQuery } from '@core/ui/vault/chain/tron/useTronAccountResourcesQuery'
import { Button } from '@lib/ui/buttons/Button'
import { CalendarClockIcon } from '@lib/ui/icons/CalendarClockIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const tronCoinKey = extractCoinKey(chainFeeCoin[Chain.Tron])

const WithdrawalRow = styled(HStack)`
  padding: 8px 0;
  border-bottom: 1px solid ${getColor('foregroundExtra')};

  &:last-child {
    border-bottom: none;
  }
`

const ClaimableBadge = styled(Text)`
  color: ${getColor('primary')};
`

export const TronDefiDashboard = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const resourcesQuery = useTronAccountResourcesQuery()

  const totalFrozenTrx = resourcesQuery.data
    ? sunToTrx(
        resourcesQuery.data.frozenForBandwidthSun +
          resourcesQuery.data.frozenForEnergySun
      )
    : 0

  const hasFrozenBalance = totalFrozenTrx > 0

  const navigateToFreeze = () => {
    navigate({
      id: 'deposit',
      state: {
        coin: tronCoinKey,
        action: 'freeze',
        entryPoint: 'defi',
      },
    })
  }

  const navigateToUnfreeze = () => {
    navigate({
      id: 'deposit',
      state: {
        coin: tronCoinKey,
        action: 'unfreeze',
        entryPoint: 'defi',
      },
    })
  }

  return (
    <VStack gap={16}>
      <TronResourcesSection />

      <Panel>
        <VStack gap={16}>
          <Text weight="500" size={16}>
            {t('tron_freeze_title')}
          </Text>

          <VStack gap={4}>
            <Text color="shy" size={13}>
              {t('tron_frozen_label')}
            </Text>
            {resourcesQuery.isPending ? (
              <Skeleton width="100px" height="24px" />
            ) : (
              <Text weight="600" size={20}>
                {totalFrozenTrx.toFixed(6)} TRX
              </Text>
            )}
          </VStack>

          <HStack gap={12} fullWidth>
            <Button
              kind="outlined"
              onClick={navigateToUnfreeze}
              disabled={!hasFrozenBalance}
              style={{ flex: 1 }}
            >
              {t('tron_unfreeze_button')}
            </Button>
            <Button onClick={navigateToFreeze} style={{ flex: 1 }}>
              {t('tron_freeze_button')}
            </Button>
          </HStack>
        </VStack>
      </Panel>

      {resourcesQuery.data &&
        resourcesQuery.data.unfreezingEntries.length > 0 && (
          <Panel>
            <VStack gap={12}>
              <HStack gap={8} alignItems="center">
                <CalendarClockIcon />
                <Text weight="500" size={14}>
                  {t('tron_pending_withdrawals')}
                </Text>
              </HStack>

              <VStack>
                {resourcesQuery.data.unfreezingEntries.map((entry, index) => {
                  const amountTrx = sunToTrx(entry.unfreezeAmountSun)
                  const timeLabel = formatTronWithdrawalTime(entry.expireTimeMs)
                  const isClaimable = entry.expireTimeMs <= Date.now()

                  return (
                    <WithdrawalRow
                      key={index}
                      alignItems="center"
                      justifyContent="space-between"
                      fullWidth
                    >
                      <VStack gap={2}>
                        <Text size={14}>{amountTrx.toFixed(6)} TRX</Text>
                        {isClaimable ? (
                          <ClaimableBadge size={12}>
                            {t('tron_ready_to_claim')}
                          </ClaimableBadge>
                        ) : (
                          <Text color="shy" size={12}>
                            {timeLabel}
                          </Text>
                        )}
                      </VStack>
                    </WithdrawalRow>
                  )
                })}
              </VStack>
            </VStack>
          </Panel>
        )}
    </VStack>
  )
}
