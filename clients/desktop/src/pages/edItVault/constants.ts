import BackupIcon from '../../lib/ui/icons/BackupIcon';
import { QuestionMarkIcon } from '../../lib/ui/icons/QuestionMarkIcon';
import ReshareIcon from '../../lib/ui/icons/ReshareIcon';
import { SignatureIcon } from '../../lib/ui/icons/SignatureIcon';
import SquareAndPencilIcon from '../../lib/ui/icons/SquareAndPencilIcon';
import TrashIcon from '../../lib/ui/icons/TrashIcon';
import { TextColor } from '../../lib/ui/text';
import { AppPathsWithNoParamsOrState } from '../../navigation';

type SettingItem = {
  titleKey: string;
  subtitleKey: string;
  icon: React.ElementType;
  path: AppPathsWithNoParamsOrState;
  textColor?: TextColor;
};

export const editVaultSettingsItems: SettingItem[] = [
  {
    titleKey: 'vault_settings_edit_vault_details_title',
    subtitleKey: 'vault_setting_edit_vault_details_subtitle',
    icon: QuestionMarkIcon,
    path: 'vaultDetails',
  },
  {
    titleKey: 'vault_setting_edit_vault_backup_title',
    subtitleKey: 'vault_setting_edit_vault_backup_subtitle',
    icon: BackupIcon,
    path: 'vaultBackup',
  },
  {
    titleKey: 'vault_setting_edit_vault_rename_title',
    subtitleKey: 'vault_setting_edit_vault_rename_subtitle',
    icon: SquareAndPencilIcon,
    path: 'vaultRename',
  },
  {
    titleKey: 'vault_setting_edit_vault_reshare_title',
    subtitleKey: 'vault_setting_edit_vault_reshare_subtitle',
    icon: ReshareIcon,
    path: 'reshareVault',
  },
  {
    titleKey: 'sign',
    subtitleKey: 'sign_custom_message',
    icon: SignatureIcon,
    path: 'signCustomMessage',
  },
  {
    titleKey: 'vault_setting_edit_vault_delete_title',
    subtitleKey: 'vault_setting_edit_vault_delete_subtitle',
    icon: TrashIcon,
    path: 'vaultDelete',
    textColor: 'danger',
  },
];
