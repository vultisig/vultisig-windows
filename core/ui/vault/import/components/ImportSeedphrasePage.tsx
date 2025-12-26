import { useTranslation } from 'react-i18next'

export const ImportSeedphrasePage = () => {
  const { t } = useTranslation()

  return <div>{t('import_seedphrase')}</div>
}
