import { useTranslation } from 'react-i18next';

import { VStack } from '../../../../lib/ui/layout/Stack';
import { Text } from '../../../../lib/ui/text';
import { FancyLoader } from '../../../../ui/pending/FancyLoader';

export const LookingForDevices = () => {
  const { t } = useTranslation();

  return (
    <VStack gap={8} alignItems="center">
      <Text weight="600" color="contrast">
        {t('looking_for_devices')}
      </Text>
      <FancyLoader />
    </VStack>
  );
};
