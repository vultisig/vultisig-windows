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

  const formattedMessage = useMemo(
    () =>
      withFallback(
        attempt(() => JSON.stringify(JSON.parse(value.message), null, 2)),
        value.message
      ),
    [value.message]
  )

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
