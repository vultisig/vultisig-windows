import { useAppNavigate } from '@clients/desktop/src/navigation/hooks/useAppNavigate'
import { SettingsItem } from '@core/ui/settings/SettingsItem'
import { CloudArrowUpIcon } from '@lib/ui/icons/CloudArrowUpIcon'
import { useTranslation } from 'react-i18next'

export const CheckUpdate = () => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()

  return (
    <SettingsItem
      icon={<CloudArrowUpIcon />}
      onClick={() => navigate({ id: 'checkUpdate' })}
      title={t('check_for_update')}
    />
  )
}
