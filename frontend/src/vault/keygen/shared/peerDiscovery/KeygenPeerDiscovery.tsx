import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Button } from '../../../../lib/ui/buttons/Button';
import { uniformColumnGrid } from '../../../../lib/ui/css/uniformColumnGrid';
import { getFormProps } from '../../../../lib/ui/form/utils/getFormProps';
import { VStack } from '../../../../lib/ui/layout/Stack';
import { TakeWholeSpaceCenterContent } from '../../../../lib/ui/layout/TakeWholeSpaceCenterContent';
import { Spinner } from '../../../../lib/ui/loaders/Spinner';
import {
  ComponentWithDisabledState,
  ComponentWithForwardActionProps,
} from '../../../../lib/ui/props';
import { QueryDependant } from '../../../../lib/ui/query/components/QueryDependant';
import { Query } from '../../../../lib/ui/query/Query';
import { StrictText } from '../../../../lib/ui/text';
import { PageContent } from '../../../../ui/page/PageContent';
import { KeygenNetworkReminder } from '../KeygenNetworkReminder';
import { PeersManager } from '../PeersManager';
import { KeygenPeerDiscoveryQrCode } from './KeygenPeerDiscoveryQrCode';
import { ManageServerType } from './ManageServerType';

const Content = styled.div`
  ${uniformColumnGrid({
    minChildrenWidth: 320,
    gap: 40,
    fullWidth: true,
  })}
  flex: 1;
  align-items: center;
`;

type KeygenPeerDiscoveryProps = ComponentWithForwardActionProps &
  ComponentWithDisabledState & {
    joinUrlQuery: Query<string>;
  };

export const KeygenPeerDiscovery = ({
  onForward,
  isDisabled,
  joinUrlQuery,
}: KeygenPeerDiscoveryProps) => {
  const { t } = useTranslation();

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
        <QueryDependant
          query={joinUrlQuery}
          success={value => <KeygenPeerDiscoveryQrCode value={value} />}
          pending={() => (
            <TakeWholeSpaceCenterContent>
              <Spinner />
            </TakeWholeSpaceCenterContent>
          )}
          error={() => (
            <TakeWholeSpaceCenterContent>
              <StrictText>{t('failed_to_generate_qr_code')}</StrictText>
            </TakeWholeSpaceCenterContent>
          )}
        />

        <VStack gap={40} flexGrow alignItems="center">
          <ManageServerType />
          <PeersManager />

          <KeygenNetworkReminder />
        </VStack>
      </Content>
      <Button type="submit" isDisabled={isDisabled}>
        {t('continue')}
      </Button>
    </PageContent>
  );
};
