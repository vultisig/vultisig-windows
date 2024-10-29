import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ChevronRightIcon } from '../../../lib/ui/icons/ChevronRightIcon';
import { TriangleAlertIcon } from '../../../lib/ui/icons/TriangleAlertIcon';
import { Text } from '../../../lib/ui/text';
import { appPaths } from '../../../navigation';
import { ChevronIconButton, Content } from './VaultBackupReminderBanner.styles';

const VaultBackupReminderBanner = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div>
      <Content data-testid="VaultBackupBanner-Content">
        <TriangleAlertIcon height={24} width={24} />
        <Text color="regular" size={14} weight="500">
          {t('vault_backup_banner_title')}
        </Text>
        <ChevronIconButton onClick={() => navigate(appPaths.vaultBackup)}>
          <ChevronRightIcon size={24} />
        </ChevronIconButton>
      </Content>
    </div>
  );
};

export default VaultBackupReminderBanner;
