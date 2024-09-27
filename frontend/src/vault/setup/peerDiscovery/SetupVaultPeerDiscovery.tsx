import Lottie from 'lottie-react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import loadingAnimation from '../../../../public/assets/images/loadingAnimation.json';
import SelectDevice from '../../../components/selectDevice/SelectDevice';
import { Button } from '../../../lib/ui/buttons/Button';
import { uniformColumnGrid } from '../../../lib/ui/css/uniformColumnGrid';
import { getFormProps } from '../../../lib/ui/form/utils/getFormProps';
import { VStack } from '../../../lib/ui/layout/Stack';
import { ComponentWithForwardActionProps } from '../../../lib/ui/props';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { getQueryDependantDefaultProps } from '../../../lib/ui/query/utils/getQueryDependantDefaultProps';
import { PageContent } from '../../../ui/page/PageContent';
import { KeygenNetworkReminder } from '../../keygen/shared/KeygenNetworkReminder';
import { useCurrentPeers } from '../state/currentPeers';
import { useIsPeerDiscoveryStepDisabled } from './hooks/useIsPeerDiscoveryStepDisabled';
import { ManageServerType } from './ManageServerType';
import { usePeerOptionsQuery } from './queries/usePeerOptionsQuery';
import { SetupVaultPeerDiscoveryQrCode } from './SetupVaultPeerDiscoveryQrCode';

const Content = styled.div`
  ${uniformColumnGrid({
    minChildrenWidth: 320,
    gap: 40,
    fullWidth: true,
  })}
  flex: 1;
  align-items: center;
`;

export const SetupVaultPeerDiscovery = ({
  onForward,
}: ComponentWithForwardActionProps) => {
  const { t } = useTranslation();
  const [peers, setPeers] = useCurrentPeers();

  const isDisabled = useIsPeerDiscoveryStepDisabled();

  const peerOptionsQuery = usePeerOptionsQuery();

  return (
    <PageContent
      as="form"
      gap={40}
      {...getFormProps({
        onSubmit: onForward,
        isDisabled,
      })}
    >
      <Content>
        <SetupVaultPeerDiscoveryQrCode />
        <VStack gap={40} flexGrow alignItems="center" justifyContent="center">
          <ManageServerType />
          <QueryDependant
            query={peerOptionsQuery}
            success={options => (
              <>
                {options.length == 0 ? (
                  <>
                    <h3 className="mt-5 font-semibold">
                      {t('looking_for_devices')}
                    </h3>
                    <div className="w-28 h-auto mx-auto my-5">
                      <Lottie animationData={loadingAnimation} loop={true} />
                    </div>
                  </>
                ) : (
                  <SelectDevice
                    devices={options}
                    selectedDevices={peers}
                    setSelectedDevices={setPeers}
                  />
                )}
              </>
            )}
            {...getQueryDependantDefaultProps('devices')}
          />

          <KeygenNetworkReminder />
        </VStack>
      </Content>
      <Button type="submit" isDisabled={isDisabled}>
        {t('continue')}
      </Button>
    </PageContent>
  );
};
