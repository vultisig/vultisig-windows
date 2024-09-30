import Lottie from 'lottie-react';
import { useTranslation } from 'react-i18next';

import loadingAnimation from '../../../../public/assets/images/loadingAnimation.json';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';

export const LookingForDevices = () => {
  const { t } = useTranslation();

  return (
    <VStack gap={8} alignItems="center">
      <Text weight="600" color="contrast">
        {t('looking_for_devices')}
      </Text>
      <Lottie
        style={{ width: 120 }}
        animationData={loadingAnimation}
        loop={true}
      />
    </VStack>
  );
};
