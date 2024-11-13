import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ChevronRightIcon } from '../../../lib/ui/icons/ChevronRightIcon';
import { TriangleAlertIcon } from '../../../lib/ui/icons/TriangleAlertIcon';
import { Text } from '../../../lib/ui/text';
import { makeAppPath } from '../../../navigation';
import {
  ChevronIconWrapper,
  ContentWrapperButton,
} from './VaultBackupBannerBanner.styles';

const VaultBackupBanner = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <ContentWrapperButton
      onClick={() => navigate(makeAppPath('vaultBackup'))}
      data-testid="VaultBackupBanner-Content"
    >
      <TriangleAlertIcon height={24} width={24} />
      <Text color="regular" size={14} weight="500">
        {t('vault_backup_banner_title')}
      </Text>
      <ChevronIconWrapper>
        <ChevronRightIcon size={24} />
      </ChevronIconWrapper>
    </ContentWrapperButton>
  );
};

export default VaultBackupBanner;
