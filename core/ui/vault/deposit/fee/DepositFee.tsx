import { useTranslation } from 'react-i18next'

import { DepositFeeValue } from './DepositFeeValue'

export const DepositFee = () => {
  const { t } = useTranslation()

  return (
    <>
      <span>
        {t('gas')} ({t('auto')})
      </span>
      <DepositFeeValue />
    </>
  )
}
