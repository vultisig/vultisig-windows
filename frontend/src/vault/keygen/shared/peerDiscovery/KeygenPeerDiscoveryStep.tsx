import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Button } from '../../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../../lib/ui/form/utils/getFormProps';
import { VStack } from '../../../../lib/ui/layout/Stack';
import { TakeWholeSpaceCenterContent } from '../../../../lib/ui/layout/TakeWholeSpaceCenterContent';
import { Spinner } from '../../../../lib/ui/loaders/Spinner';
import {
  ComponentWithBackActionProps,
  ComponentWithDisabledState,
  ComponentWithForwardActionProps,
  TitledComponentProps,
} from '../../../../lib/ui/props';
import { QueryDependant } from '../../../../lib/ui/query/components/QueryDependant';
import { Query } from '../../../../lib/ui/query/Query';
import { StrictText, Text } from '../../../../lib/ui/text';
import { ProductLogo } from '../../../../ui/logo/ProductLogo';
import { PageContent } from '../../../../ui/page/PageContent';
import { PageHeader } from '../../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../../ui/page/PageHeaderTitle';
import { useVaultType } from '../../../setup/shared/state/vaultType';
import { KeygenNetworkReminder } from '../KeygenNetworkReminder';
import { PeersManager } from '../PeersManager';
import { DownloadKeygenQrCode } from './DownloadKeygenQrCode';
import { KeygenPeerDiscoveryQrCode } from './KeygenPeerDiscoveryQrCode';
import { ManageServerType } from './ManageServerType';

type KeygenPeerDiscoveryStepProps = ComponentWithForwardActionProps &
  Partial<ComponentWithBackActionProps> &
  TitledComponentProps &
  ComponentWithDisabledState & {
    joinUrlQuery: Query<string>;
  };

const Content = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
`;

const Wrapper = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
`;

const AdditionalInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-bottom: 24px;
`;

const AdditionalInfoTextWrapper = styled.div`
  display: flex;
  gap: 24px;
  flex-direction: column;
  align-items: center;
`;

export const KeygenPeerDiscoveryStep = ({
  onForward,
  onBack,
  title,
  isDisabled,
  joinUrlQuery,
}: KeygenPeerDiscoveryStepProps) => {
  const { t } = useTranslation();

  const vaultType = useVaultType();

  return (
    <>
      <PageHeader
        title={<PageHeaderTitle>{title}</PageHeaderTitle>}
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        secondaryControls={
          <QueryDependant
            query={joinUrlQuery}
            success={value => <DownloadKeygenQrCode value={value} />}
            error={() => null}
            pending={() => null}
          />
        }
      />
      <PageContent
        as="form"
        {...getFormProps({
          onSubmit: onForward,
          isDisabled,
        })}
      >
        <Wrapper>
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

            <VStack gap={40} alignItems="center">
              {vaultType === 'secure' && <ManageServerType />}
              <PeersManager />
              <KeygenNetworkReminder />
            </VStack>
          </Content>
          <AdditionalInfo>
            <AdditionalInfoTextWrapper>
              <Text size={14} color="contrast" weight={500}>
                Join Keygen
              </Text>
              <Text size={14} color="contrast" weight={500}>
                Scan with devices to join the vault generation
              </Text>
            </AdditionalInfoTextWrapper>
            <ProductLogo fontSize={150} />
          </AdditionalInfo>
        </Wrapper>
        <Button type="submit" isDisabled={isDisabled}>
          {t('continue')}
        </Button>
      </PageContent>
    </>
  );
};
