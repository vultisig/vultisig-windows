import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { SendChainSpecificProvider } from './SendChainSpecificProvider'
import { SendFiatFeeValue } from './SendFiatFeeValue'

export const SendFiatFee = () => {
  const { t } = useTranslation()

  return (
    <>
      <Text size={13} color="shy">
        {t('est_network_fee')}
      </Text>
      <SendChainSpecificProvider>
        <SendFiatFeeValue />
      </SendChainSpecificProvider>
    </>
  )
}
