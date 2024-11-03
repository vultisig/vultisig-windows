import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../lib/ui/buttons/Button';
import { PlusIcon } from '../../lib/ui/icons/PlusIcon';
import { HStack, VStack } from '../../lib/ui/layout/Stack';
import { makeAppPath } from '../../navigation';

export const ManageVaultCreation = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <VStack gap={20}>
      <Button
        onClick={() => {
          navigate(makeAppPath('setupVault', {}));
        }}
        kind="primary"
      >
        <HStack alignItems="center" gap={8}>
          <PlusIcon /> {t('add_new_vault')}
        </HStack>
      </Button>
      <Button
        onClick={() => {
          navigate(makeAppPath('importVault'));
        }}
        kind="outlined"
      >
        {t('import_existing_vault')}
      </Button>
    </VStack>
  );
};
