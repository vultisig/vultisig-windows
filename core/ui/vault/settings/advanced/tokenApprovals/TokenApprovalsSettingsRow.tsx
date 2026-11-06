import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { SettingsItem } from '@core/ui/settings/SettingsItem'
import { useCore } from '@core/ui/state/core'
import { LinkSlashIcon } from '@lib/ui/icons/LinkSlashIcon'
import { useTranslation } from 'react-i18next'

/**
 * Revoke Approvals entry in the General settings section. Extension only for
 * now; the desktop app has no token approvals page in its settings.
 */
export const TokenApprovalsSettingsRow = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { client } = useCore()

  if (client !== 'extension') return null

  return (
    <SettingsItem
      icon={<LinkSlashIcon />}
      onClick={() => navigate({ id: 'tokenApprovals' })}
      title={t('revoke_approvals')}
    />
  )
}
