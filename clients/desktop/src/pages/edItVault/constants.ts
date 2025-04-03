import BackupIcon from '@lib/ui/icons/BackupIcon'
import { QuestionMarkIcon } from '@lib/ui/icons/QuestionMarkIcon'
import ReshareIcon from '@lib/ui/icons/ReshareIcon'
import { SignatureIcon } from '@lib/ui/icons/SignatureIcon'
import SquareAndPencilIcon from '@lib/ui/icons/SquareAndPencilIcon'
import TrashIcon from '@lib/ui/icons/TrashIcon'
import { TextColor } from '@lib/ui/text'
import { TFunction } from 'i18next'

import { AppPathsWithNoParamsOrState } from '../../navigation'

type SettingItem = {
  title: string
  subtitle: string
  icon: React.ElementType
  path: AppPathsWithNoParamsOrState
  textColor?: TextColor
}

export function getEditVaultSettingsItems(t: TFunction): SettingItem[] {
  return [
    {
      title: t('details'),
      subtitle: t('vault_setting_edit_vault_details_subtitle'),
      icon: QuestionMarkIcon,
      path: 'vaultDetails',
    },
    {
      title: t('backup'),
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
      title: t('reshare'),
      subtitle: t('vault_setting_edit_vault_reshare_subtitle'),
      icon: ReshareIcon,
      path: 'reshareVault',
    },
    {
      title: t('sign'),
      subtitle: t('sign_custom_message'),
      icon: SignatureIcon,
      path: 'signCustomMessage',
    },
    {
      title: t('delete'),
      subtitle: t('vault_setting_edit_vault_delete_subtitle'),
      icon: TrashIcon,
      path: 'vaultDelete',
      textColor: 'danger',
    },
  ]
}
