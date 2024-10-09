import { useNavigate } from 'react-router-dom';

import { ChevronRightIcon } from '../../lib/ui/icons/ChevronRightIcon';
import { TriangleAlertIcon } from '../../lib/ui/icons/TriangleAlertIcon';
import { Text } from '../../lib/ui/text';
import { appPaths } from '../../navigation';
import {
  ChevronIconButton,
  Content,
  Wrapper,
} from './VaultBackupBanner.styles';

const VaultBackupBanner = () => {
  const navigate = useNavigate();

  return (
    <Wrapper data-testid="VaultBackupBanner">
      <Content data-testid="VaultBackupBanner-Content">
        <TriangleAlertIcon height={24} width={24} />
        <Text color="contrast" size={14} weight="500">
          Backup your vault now!
        </Text>
        <ChevronIconButton onClick={() => navigate(appPaths.vaultBackup)}>
          <ChevronRightIcon size={24} />
        </ChevronIconButton>
      </Content>
    </Wrapper>
  );
};

export default VaultBackupBanner;
