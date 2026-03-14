import {
  formatMoneroAtomicAmount,
  isMoneroBalanceFinalisePayload,
  parseMoneroBalanceFinaliseMessage,
} from '@core/chain/chains/monero/balanceFinaliseMessage'
import { CustomMessagePayload } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import {
  TxOverviewChainDataRow,
  TxOverviewRow,
} from '@core/ui/chain/tx/TxOverviewRow'
import { ValueProp } from '@lib/ui/props'
import { attempt, withFallback } from '@lib/utils/attempt'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const KeysignCustomMessageInfo = ({
  value,
}: ValueProp<CustomMessagePayload>) => {
  const { t } = useTranslation()

  const moneroBalanceFinalise = useMemo(
    () =>
      isMoneroBalanceFinalisePayload(value)
        ? parseMoneroBalanceFinaliseMessage(value.message)
        : null,
    [value]
  )

  const formattedMessage = useMemo(
    () =>
      withFallback(
        attempt(() => JSON.stringify(JSON.parse(value.message), null, 2)),
        value.message
      ),
    [value.message]
  )

  if (moneroBalanceFinalise) {
    return (
      <>
        <TxOverviewRow>
          <span>{t('outputs_found')}</span>
          {moneroBalanceFinalise.outputCount.toLocaleString()}
        </TxOverviewRow>
        <TxOverviewRow>
          <span>{t('current_scanned_balance')}</span>
          {formatMoneroAtomicAmount(moneroBalanceFinalise.balanceAtomic)}
        </TxOverviewRow>
      </>
    )
  }

  return (
    <>
      <TxOverviewRow>
        <span>{t('method')}</span>
        {value.method}
      </TxOverviewRow>
      <TxOverviewChainDataRow>
        <span>{t('message')}</span>
        <pre
          style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        >
          {formattedMessage}
        </pre>
      </TxOverviewChainDataRow>
    </>
  )
}
