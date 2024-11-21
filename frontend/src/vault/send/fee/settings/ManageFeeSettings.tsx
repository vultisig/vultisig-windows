import { t } from 'i18next';

import { Opener } from '../../../../lib/ui/base/Opener';
import { Button } from '../../../../lib/ui/buttons/Button';
import { BodyPortal } from '../../../../lib/ui/dom/BodyPortal';
import { SettingsIcon } from '../../../../lib/ui/icons/SettingsIcon';
import { VStack } from '../../../../lib/ui/layout/Stack';
import { Spinner } from '../../../../lib/ui/loaders/Spinner';
import { Backdrop } from '../../../../lib/ui/modal/Backdrop';
import { ModalContainer } from '../../../../lib/ui/modal/ModalContainer';
import { QueryDependant } from '../../../../lib/ui/query/components/QueryDependant';
import { StrictText } from '../../../../lib/ui/text';
import { EvmChain } from '../../../../model/chain';
import { PageHeaderIconButton } from '../../../../ui/page/PageHeaderIconButton';
import { useSpecificSendTxInfoQuery } from '../../queries/useSpecificSendTxInfoQuery';
import { useCurrentSendCoin } from '../../state/sendCoin';
import { SpecificSendTxInfoProvider } from '../SendSpecificTxInfoProvider';
import { ManageFeeSettingsOverlay } from './ManageFeeSettingsOverlay';

export const ManageFeeSettings = () => {
  const [{ chainId }] = useCurrentSendCoin();

  const txSpecificInfoQuery = useSpecificSendTxInfoQuery();

  if (!(chainId in EvmChain)) {
    return null;
  }

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
              <ManageFeeSettingsOverlay onClose={onClose} />{' '}
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
