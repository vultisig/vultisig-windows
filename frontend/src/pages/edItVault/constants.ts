import BackupIcon from '../../lib/ui/icons/BackupIcon';
import InfoIcon from '../../lib/ui/icons/InfoIcon';
import ReshareIcon from '../../lib/ui/icons/ReshareIcon';
import SquareAndPencilIcon from '../../lib/ui/icons/SquareAndPencilIcon';
import TrashRedIcon from '../../lib/ui/icons/TrashRedIcon';
import { TextColor } from '../../lib/ui/text';

type SettingItem = {
  titleKey: string;
  subtitleKey: string;
  icon: React.ElementType;
  path: string;
  textColor?: TextColor;
};

export const editVaultSettingsItems: SettingItem[] = [
  {
    titleKey: 'vault_settings_edit_vault_details_title',
    subtitleKey: 'vault_setting_edit_vault_details_subtitle',
    icon: InfoIcon,
    path: '/vault/settings/vault-settings/details',
  },
  {
    titleKey: 'vault_setting_edit_vault_backup_title',
    subtitleKey: 'vault_setting_edit_vault_backup_subtitle',
    icon: BackupIcon,
    path: '/vault/settings/vault-settings/backup-vault',
  },
  {
    titleKey: 'vault_setting_edit_vault_rename_title',
    subtitleKey: 'vault_setting_edit_vault_rename_subtitle',
    icon: SquareAndPencilIcon,
    path: '/vault/settings/vault-settings/rename-vault',
  },
  {
    titleKey: 'vault_setting_edit_vault_reshare_title',
    subtitleKey: 'vault_setting_edit_vault_reshare_subtitle',
    icon: ReshareIcon,
    path: '/vault/settings/vault-settings/reshare-vault',
  },
  {
    titleKey: 'vault_setting_edit_vault_delete_title',
    subtitleKey: 'vault_setting_edit_vault_delete_subtitle',
    icon: TrashRedIcon,
    path: '/vault/settings/vault-settings/delete-vault',
    textColor: 'danger',
  },
];
