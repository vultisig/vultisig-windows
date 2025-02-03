import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { VStack } from '../../../lib/ui/layout/Stack';
import { ChildrenProp } from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';

export const AddVaultsToFolderContainer: FC<ChildrenProp> = ({ children }) => {
  const { t } = useTranslation();

  return (
    <VStack gap={8}>
      <Text weight="500" color="supporting" size={14}>
        {t('add_vaults_to_folder')}
      </Text>
      {children}
    </VStack>
  );
};
