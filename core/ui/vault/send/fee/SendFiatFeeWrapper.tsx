import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { ValidSendFormOnly } from '../components/ValidSendFormOnly'
import { SendFiatFeeValue } from './SendFiatFeeValue'

export const SendFiatFee = () => {
  const { t } = useTranslation()

  return (
    <ValidSendFormOnly>
      <Text size={13} color="shy">
        {t('est_network_fee')}
      </Text>
      <SendFiatFeeValue />
    </ValidSendFormOnly>
  )
}
