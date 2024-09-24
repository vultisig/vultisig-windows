import { useTranslation } from 'react-i18next';

import { VStack } from '../../../lib/ui/layout/Stack';
import { Spinner } from '../../../lib/ui/loaders/Spinner';
import { Panel } from '../../../lib/ui/panel/Panel';
import { ComponentWithChildrenProps } from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { useCurrentLocalPartyId } from '../state/currentLocalPartyId';

export const PendingKeygenMessage = ({
  children,
}: ComponentWithChildrenProps) => {
  const localPartyId = useCurrentLocalPartyId();

  const { t } = useTranslation();

  return (
    <Panel>
      <VStack alignItems="center" gap={8}>
        <Text size={24}>
          <Spinner />
        </Text>
        <VStack alignItems="center" gap={20}>
          <Text size={14} weight="700">
            {t('this_device')} {localPartyId}
          </Text>
          <Text size={14} weight="700">
            {children}
          </Text>
        </VStack>
      </VStack>
    </Panel>
  );
};
