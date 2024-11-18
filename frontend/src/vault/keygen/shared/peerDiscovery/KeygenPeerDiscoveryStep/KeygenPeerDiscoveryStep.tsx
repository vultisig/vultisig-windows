import { useTranslation } from 'react-i18next';

import { Button } from '../../../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../../../lib/ui/form/utils/getFormProps';
import { VStack } from '../../../../../lib/ui/layout/Stack';
import { TakeWholeSpaceCenterContent } from '../../../../../lib/ui/layout/TakeWholeSpaceCenterContent';
import { Spinner } from '../../../../../lib/ui/loaders/Spinner';
import {
  ComponentWithBackActionProps,
  ComponentWithDisabledState,
  ComponentWithForwardActionProps,
  TitledComponentProps,
} from '../../../../../lib/ui/props';
import { QueryDependant } from '../../../../../lib/ui/query/components/QueryDependant';
import { Query } from '../../../../../lib/ui/query/Query';
import { StrictText } from '../../../../../lib/ui/text';
import { PageContent } from '../../../../../ui/page/PageContent';
import { PageHeader } from '../../../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../../../ui/page/PageHeaderTitle';
import { useVaultType } from '../../../../setup/shared/state/vaultType';
import { KeygenNetworkReminder } from '../../KeygenNetworkReminder';
import { DownloadKeygenQrCode } from '../DownloadKeygenQrCode';
import { KeygenPeerDiscoveryQrCode } from '../KeygenPeerDiscoveryQrCode';
import { KeygenPeersManager } from '../KeygenPeersManager';
import { ManageServerType } from '../ManageServerType';
import { Content } from './KegenPeerDiscoveryStep.styled';

type KeygenPeerDiscoveryStepProps = ComponentWithForwardActionProps &
  Partial<ComponentWithBackActionProps> &
  TitledComponentProps &
  ComponentWithDisabledState & {
    joinUrlQuery: Query<string>;
  };

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
            <KeygenPeersManager />
            <KeygenNetworkReminder />
          </VStack>
        </Content>

        <Button type="submit" isDisabled={isDisabled}>
          {t('continue')}
        </Button>
      </PageContent>
    </>
  );
};
