import { useTranslation } from 'react-i18next';

import { HStack, VStack } from '../../../../lib/ui/layout/Stack';
import { MatchQuery } from '../../../../lib/ui/query/components/MatchQuery';
import { Query } from '../../../../lib/ui/query/Query';
import { Text } from '../../../../lib/ui/text';
import { CurrentPeersCorrector } from './CurrentPeersCorrector';
import { LookingForDevices } from './LookingForDevices';
import { PeerOption } from './peers/PeerOption';

type PeersManageProps = {
  peerOptionsQuery: Query<string[]>;
};

export const PeersManager = ({ peerOptionsQuery }: PeersManageProps) => {
  const { t } = useTranslation();

  return (
    <VStack
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: 160 }}
    >
      <MatchQuery
        value={peerOptionsQuery}
        error={() => t('failed_to_load')}
        pending={() => t('loading')}
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
      />
    </VStack>
  );
};
