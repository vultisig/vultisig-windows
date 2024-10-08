import { useTranslation } from 'react-i18next';

import { VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { useCurrentServerType } from '../state/currentServerType';
import { KeygenServerTypeIcon } from './KeygenServerTypeIcon';

export const KeygenNetworkReminder = () => {
  const { t } = useTranslation();

  const [serverType] = useCurrentServerType();

  return (
    <VStack alignItems="center" gap={8}>
      <Text color="primary" size={30}>
        <KeygenServerTypeIcon value={serverType} />
      </Text>
      <Text
        style={{ maxWidth: 320 }}
        centerHorizontally
        size={14}
        weight="400"
        family="mono"
        color="contrast"
      >
        {t(`keygen_reminder_${serverType}`)}
      </Text>
    </VStack>
  );
};
