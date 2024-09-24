import { useTranslation } from 'react-i18next';

import { WifiIcon } from '../../../lib/ui/icons/WifiIcon';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';

export const KeygenNetworkReminder = () => {
  const { t } = useTranslation();

  return (
    <VStack alignItems="center" gap={8}>
      <Text color="primary" size={30}>
        <WifiIcon />
      </Text>
      <Text
        style={{ maxWidth: 240 }}
        centerHorizontally
        size={14}
        weight="400"
        family="mono"
        color="contrast"
      >
        {t('devices_on_same_wifi')}
      </Text>
    </VStack>
  );
};
