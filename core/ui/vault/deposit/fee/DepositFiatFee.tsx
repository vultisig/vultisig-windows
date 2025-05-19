import { useTranslation } from 'react-i18next'

import { DepositFiatFeeValue } from './DepositFiatFeeValue'

export const DepositFiatFee = () => {
  const { t } = useTranslation()

  return (
    <>
      <span>{t('network_fee')}</span>
      <DepositFiatFeeValue />
    </>
  )
}
