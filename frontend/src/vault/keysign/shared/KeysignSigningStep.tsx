import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { CurrentTxHashProvider } from '../../../chain/state/currentTxHash';
import { ProgressLine } from '../../../lib/ui/flow/ProgressLine';
import { VStack } from '../../../lib/ui/layout/Stack';
import { ComponentWithBackActionProps } from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { extractErrorMsg } from '../../../lib/utils/error/extractErrorMsg';
import { Chain } from '../../../model/chain';
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider';
import { BlockchainServiceFactory } from '../../../services/Blockchain/BlockchainServiceFactory';
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { KeygenNetworkReminder } from '../../keygen/shared/KeygenNetworkReminder';
import { MatchKeygenSessionStatus } from '../../keygen/shared/MatchKeygenSessionStatus';
import { PendingKeygenMessage } from '../../keygen/shared/PendingKeygenMessage';
import { useCurrentSessionId } from '../../keygen/shared/state/currentSessionId';
import { useCurrentServerUrl } from '../../keygen/state/currentServerUrl';
import { useCurrentHexEncryptionKey } from '../../setup/state/currentHexEncryptionKey';
import { useCurrentVault } from '../../state/currentVault';
import { KeysignSigningState } from './KeysignSigningState';
import { KeysignSummaryStep } from './KeysignSummaryStep';
import { useCurrentKeysignMsgs } from './state/currentKeysignMsgs';
import { useKeysignPayload } from './state/keysignPayload';

export const KeysignSigningStep = ({
  onBack,
}: Partial<ComponentWithBackActionProps>) => {
  const payload = useKeysignPayload();
  const msgs = useCurrentKeysignMsgs();
  const walletCore = useAssertWalletCore();
  const vault = useCurrentVault();
  const sessionId = useCurrentSessionId();
  const encryptionKeyHex = useCurrentHexEncryptionKey();
  const serverUrl = useCurrentServerUrl();
  const { t } = useTranslation();

  const { mutate: startKeysign, ...mutationStatus } = useMutation({
    mutationFn: async () => {
      const { chain } = shouldBePresent(payload.coin);
      const blockchainService = BlockchainServiceFactory.createService(
        chain as Chain,
        walletCore
      );

      return blockchainService.signAndBroadcastTransaction(
        vault,
        msgs,
        sessionId,
        encryptionKeyHex,
        serverUrl,
        payload
      );
    },
  });

  useEffect(() => startKeysign(), [startKeysign]);

  return (
    <MatchQuery
      value={mutationStatus}
      success={txHash => (
        <CurrentTxHashProvider value={txHash}>
          <KeysignSummaryStep />
        </CurrentTxHashProvider>
      )}
      error={error => (
        <FullPageFlowErrorState
          title={t('keysign')}
          message={t('signing_error')}
          errorMessage={extractErrorMsg(error)}
        />
      )}
      pending={() => (
        <>
          <PageHeader
            primaryControls={<PageHeaderBackButton onClick={onBack} />}
            title={<PageHeaderTitle>{t('keysign')}</PageHeaderTitle>}
          />
          <PageContent data-testid="KeysignVerifyStep-PageContent">
            <VStack flexGrow>
              <MatchKeygenSessionStatus
                pending={() => (
                  <>
                    <ProgressLine value={0.75} />
                    <VStack
                      flexGrow
                      alignItems="center"
                      justifyContent="center"
                    >
                      <PendingKeygenMessage>
                        {t('waiting_for_keysign_start')}
                      </PendingKeygenMessage>
                    </VStack>
                  </>
                )}
                active={value => <KeysignSigningState value={value} />}
              />
            </VStack>
            <KeygenNetworkReminder />
          </PageContent>
        </>
      )}
    />
  );
};
