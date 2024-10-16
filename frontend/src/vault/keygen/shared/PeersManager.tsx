import { useTranslation } from 'react-i18next';

import { HStack, VStack } from '../../../lib/ui/layout/Stack';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { getQueryDependantDefaultProps } from '../../../lib/ui/query/utils/getQueryDependantDefaultProps';
import { Text } from '../../../lib/ui/text';
import { CurrentPeersCorrector } from './peerDiscovery/CurrentPeersCorrector';
import { LookingForDevices } from './peerDiscovery/LookingForDevices';
import { PeerOption } from './peerDiscovery/peers/PeerOption';
import { usePeerOptionsQuery } from './peerDiscovery/queries/usePeerOptionsQuery';

export const PeersManager = () => {
  const { t } = useTranslation();

  const peerOptionsQuery = usePeerOptionsQuery();

  return (
    <VStack
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: 160 }}
    >
      <QueryDependant
        query={peerOptionsQuery}
        success={options => (
          <>
            <CurrentPeersCorrector />
            {options.length == 0 ? (
              <LookingForDevices />
            ) : (
              <VStack alignItems="center" gap={48}>
                <Text weight="600" color="contrast">
                  {t('select_the_pairing_devices')}
                </Text>
                <HStack gap={48} wrap="wrap">
                  {options.map((device, index) => (
                    <PeerOption key={index} value={device} />
                  ))}
                </HStack>
              </VStack>
            )}
          </>
        )}
        {...getQueryDependantDefaultProps('devices')}
      />
    </VStack>
  );
};
