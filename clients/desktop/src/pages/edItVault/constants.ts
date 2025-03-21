import BackupIcon from '../../lib/ui/icons/BackupIcon'
import { QuestionMarkIcon } from '../../lib/ui/icons/QuestionMarkIcon'
import ReshareIcon from '../../lib/ui/icons/ReshareIcon'
import { SignatureIcon } from '../../lib/ui/icons/SignatureIcon'
import SquareAndPencilIcon from '../../lib/ui/icons/SquareAndPencilIcon'
import TrashIcon from '../../lib/ui/icons/TrashIcon'
import { TextColor } from '../../lib/ui/text'
import { AppPathsWithNoParamsOrState } from '../../navigation'

type SettingItem = {
  title: string
  subtitle: string
  icon: React.ElementType
  path: AppPathsWithNoParamsOrState
  textColor?: TextColor
}

export function getEditVaultSettingsItems(
  t: (key: string) => string
): SettingItem[] {
  return [
    {
      title: t('vault_settings_edit_vault_details_title'),
      subtitle: t('vault_setting_edit_vault_details_subtitle'),
      icon: QuestionMarkIcon,
      path: 'vaultDetails',
    },
    {
      title: t('vault_setting_edit_vault_backup_title'),
      subtitle: t('vault_setting_edit_vault_backup_subtitle'),
      icon: BackupIcon,
      path: 'vaultBackup',
    },
    {
      title: t('vault_setting_edit_vault_rename_title'),
      subtitle: t('vault_setting_edit_vault_rename_subtitle'),
      icon: SquareAndPencilIcon,
      path: 'vaultRename',
    },
    {
      title: t('vault_setting_edit_vault_reshare_title'),
      subtitle: t('vault_setting_edit_vault_reshare_subtitle'),
      icon: ReshareIcon,
      path: 'reshareVault',
    },
    {
      title: t('vault_setting_edit_vault_migrate_title'),
      subtitle: t('vault_setting_edit_vault_migrate_subtitle'),
      icon: ReshareIcon,
      path: 'migrateVaultSecure',
    },
    {
      title: t('sign'),
      subtitle: t('sign_custom_message'),
      icon: SignatureIcon,
      path: 'signCustomMessage',
    },
    {
      title: t('vault_setting_edit_vault_delete_title'),
      subtitle: t('vault_setting_edit_vault_delete_subtitle'),
      icon: TrashIcon,
      path: 'vaultDelete',
      textColor: 'danger',
    },
  ]
}
