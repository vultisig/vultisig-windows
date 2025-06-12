import { CustomMessagePayload } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { ListItem } from '@lib/ui/list/item'
import { ValueProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

export const KeysignCustomMessageInfo = ({
  value,
}: ValueProp<CustomMessagePayload>) => {
  const { t } = useTranslation()

  return (
    <>
      <ListItem description={value.method} title={t('method')} />
      <ListItem description={value.message} title={t('message')} />
    </>
  )
}
