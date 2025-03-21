import { useTranslation } from 'react-i18next'

export const TestComponent = () => {
  const { t } = useTranslation()

  return <div>{t('select_n_devices_one')}</div>
}
