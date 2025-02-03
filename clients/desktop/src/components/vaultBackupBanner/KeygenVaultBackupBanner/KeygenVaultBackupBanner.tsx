import { useTranslation } from 'react-i18next';

import { TriangleAlertIcon } from '../../../lib/ui/icons/TriangleAlertIcon';
import { Text } from '../../../lib/ui/text';
import { Content, FullWidthText } from './KeygenVaultBackupBanner.styles';

const KeygenVaultBackupBanner = () => {
  const { t } = useTranslation();

  return (
    <Content data-testid="VaultBackupBanner-Content">
      <TriangleAlertIcon height={24} width={24} />
      <FullWidthText color="contrast" size={16} weight={300}>
        {t('vault_backup_keygen_banner_title_part1')}{' '}
        <Text as="span" color="contrast" weight={600} size={16}>
          {t('vault_backup_keygen_banner_title_part2')}
        </Text>{' '}
        {t('vault_backup_keygen_banner_title_part3')}
      </FullWidthText>
      <TriangleAlertIcon height={24} width={24} />
    </Content>
  );
};

export default KeygenVaultBackupBanner;
