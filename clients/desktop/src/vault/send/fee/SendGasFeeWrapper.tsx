import { useTranslation } from 'react-i18next'

import { SendChainSpecificProvider } from './SendChainSpecificProvider'
import { SendGasFeeValue } from './SendGasFeeValue'

export const SendGasFeeWrapper = () => {
  const { t } = useTranslation()

  return (
    <>
      <span>
        {t('gas')} ({t('auto')})
      </span>
      <SendChainSpecificProvider>
        <SendGasFeeValue />
      </SendChainSpecificProvider>
    </>
  )
}
