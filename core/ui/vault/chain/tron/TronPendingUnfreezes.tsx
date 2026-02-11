import {
  formatTronWithdrawalTime,
  sunToTrx,
  TronUnfreezingEntry,
} from '@core/chain/chains/tron/resources'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { SeparatedByLine } from '@lib/ui/layout/SeparatedByLine'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

type TronPendingUnfreezesProps = {
  entries: TronUnfreezingEntry[]
}

export const TronPendingUnfreezes = ({
  entries,
}: TronPendingUnfreezesProps) => {
  const { t } = useTranslation()

  if (entries.length === 0) return null

  const totalUnfreezingTrx = entries.reduce(
    (sum, entry) => sum + sunToTrx(entry.unfreezeAmountSun),
    0
  )

  return (
    <Panel>
      <SeparatedByLine gap={12}>
        <HStack fullWidth alignItems="center" justifyContent="space-between">
          <Text color="contrast" weight="600" size={14}>
            {t('tron_pending_withdrawals')}
          </Text>
          <BalanceVisibilityAware>
            <Text color="shy" weight="500" size={14}>
              {totalUnfreezingTrx.toFixed(2)} TRX
            </Text>
          </BalanceVisibilityAware>
        </HStack>

        <VStack gap={8}>
          {entries.map((entry, index) => {
            const amountTrx = sunToTrx(entry.unfreezeAmountSun)
            const timeStatus = formatTronWithdrawalTime(entry.expireTimeMs)
            const isClaimable = timeStatus === 'ready_to_claim'

            return (
              <HStack
                key={index}
                fullWidth
                alignItems="center"
                justifyContent="space-between"
              >
                <VStack gap={4}>
                  <BalanceVisibilityAware>
                    <Text color="contrast" size={14}>
                      {amountTrx.toFixed(2)} TRX
                    </Text>
                  </BalanceVisibilityAware>
                  <Text color="shy" size={12}>
                    {isClaimable ? t('tron_ready_to_claim') : timeStatus}
                  </Text>
                </VStack>
                <Text color="shy" size={14}>
                  {isClaimable ? '\u2713' : '\u23F3'}
                </Text>
              </HStack>
            )
          })}
        </VStack>
      </SeparatedByLine>
    </Panel>
  )
}
