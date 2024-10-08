import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { CurrentTxHashProvider } from '../../../chain/state/currentTxHash';
import { ProgressLine } from '../../../lib/ui/flow/ProgressLine';
import { VStack } from '../../../lib/ui/layout/Stack';
import { ComponentWithBackActionProps } from '../../../lib/ui/props';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { Chain } from '../../../model/chain';
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider';
import { BlockchainServiceFactory } from '../../../services/Blockchain/BlockchainServiceFactory';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { KeygenNetworkReminder } from '../../keygen/shared/KeygenNetworkReminder';
import { MatchKeygenSessionStatus } from '../../keygen/shared/MatchKeygenSessionStatus';
import { PendingKeygenMessage } from '../../keygen/shared/PendingKeygenMessage';
import { useCurrentServerUrl } from '../../keygen/state/currentServerUrl';
import { useAssertCurrentVault } from '../../state/useCurrentVault';
import { KeysignErrorState } from '../shared/KeysignErrorState';
import { KeysignSigningState } from '../shared/KeysignSigningState';
import { JoinKeysignSummaryStep } from './JoinKeysignSummaryStep';
import {
  useCurrentJoinKeysignMsg,
  useCurrentJoinKeysignPayload,
} from './state/currentJoinKeysignMsg';
import { useCurrentKeysignMsgs } from './state/currentKeysignMsgs';

export const JoinKeysignSigningStep = ({
  onBack,
}: ComponentWithBackActionProps) => {
  const payload = useCurrentJoinKeysignPayload();
  const msgs = useCurrentKeysignMsgs();

  const walletCore = useAssertWalletCore();

  const vault = useAssertCurrentVault();

  const { sessionId, encryptionKeyHex } = useCurrentJoinKeysignMsg();

  const serverUrl = useCurrentServerUrl();

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

  const { t } = useTranslation();

  return (
    <QueryDependant
      query={mutationStatus}
      success={txHash => (
        <CurrentTxHashProvider value={txHash}>
          <JoinKeysignSummaryStep />
        </CurrentTxHashProvider>
      )}
      error={() => <KeysignErrorState title={t('signing_error')} />}
      pending={() => (
        <>
          <PageHeader
            primaryControls={<PageHeaderBackButton onClick={onBack} />}
            title={<PageHeaderTitle>{t('keysign')}</PageHeaderTitle>}
          />
          <PageContent>
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
                active={() => <KeysignSigningState />}
              />
            </VStack>
            <KeygenNetworkReminder />
          </PageContent>
        </>
      )}
    />
  );
};
