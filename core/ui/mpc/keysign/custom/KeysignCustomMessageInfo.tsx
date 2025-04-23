import { CustomMessagePayload } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import {
  TxOverviewChainDataRow,
  TxOverviewRow,
} from '@core/ui/chain/tx/TxOverviewRow'
import { ValueProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

export const KeysignCustomMessageInfo = ({
  value,
}: ValueProp<CustomMessagePayload>) => {
  const { t } = useTranslation()

  return (
    <>
      <TxOverviewRow>
        <span>{t('method')}</span>
        {value.method}
      </TxOverviewRow>
      <TxOverviewChainDataRow>
        <span>{t('message')}</span>
        <span>{value.message}</span>
      </TxOverviewChainDataRow>
    </>
  )
}
