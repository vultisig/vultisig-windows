import { t } from 'i18next';

import { Opener } from '../../../../lib/ui/base/Opener';
import { Button } from '../../../../lib/ui/buttons/Button';
import { BodyPortal } from '../../../../lib/ui/dom/BodyPortal';
import { SettingsIcon } from '../../../../lib/ui/icons/SettingsIcon';
import { VStack } from '../../../../lib/ui/layout/Stack';
import { Spinner } from '../../../../lib/ui/loaders/Spinner';
import { Backdrop } from '../../../../lib/ui/modal/Backdrop';
import { ModalContainer } from '../../../../lib/ui/modal/ModalContainer';
import { ClosableComponentProps } from '../../../../lib/ui/props';
import { QueryDependant } from '../../../../lib/ui/query/components/QueryDependant';
import { PageHeaderIconButton } from '../../../../ui/page/PageHeaderIconButton';
import { StrictText } from '../../../deposit/DepositVerify/DepositVerify.styled';
import { useSpecificSendTxInfoQuery } from '../../queries/useSpecificSendTxInfoQuery';
import { SpecificSendTxInfoProvider } from '../SendSpecificTxInfoProvider';

type ManageFeeSettingsFrameProps = {
  render: (props: ClosableComponentProps) => React.ReactNode;
};

export const ManageFeeSettingsFrame = ({
  render,
}: ManageFeeSettingsFrameProps) => {
  const txSpecificInfoQuery = useSpecificSendTxInfoQuery();

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <PageHeaderIconButton onClick={onOpen} icon={<SettingsIcon />} />
      )}
      renderContent={({ onClose }) => (
        <QueryDependant
          query={txSpecificInfoQuery}
          success={value => (
            <SpecificSendTxInfoProvider value={value}>
              {render({ onClose })}
            </SpecificSendTxInfoProvider>
          )}
          pending={() => (
            <BodyPortal>
              <Backdrop onClose={onClose}>
                <ModalContainer>
                  <VStack alignItems="center" gap={8}>
                    <Spinner />
                    <StrictText>{t('loading')}</StrictText>
                  </VStack>
                </ModalContainer>
              </Backdrop>
            </BodyPortal>
          )}
          error={() => (
            <BodyPortal>
              <Backdrop onClose={onClose}>
                <ModalContainer>
                  <VStack alignItems="center" gap={8}>
                    <StrictText>{t('failed_to_load')}</StrictText>
                    <Button onClick={onClose}>{t('close')}</Button>
                  </VStack>
                </ModalContainer>
              </Backdrop>
            </BodyPortal>
          )}
        />
      )}
    />
  );
};
