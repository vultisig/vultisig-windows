import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { KeysignPayloadUtils } from '../../../extensions/KeysignPayload';
import { ComponentWithChildrenProps } from '../../../lib/ui/props';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { PendingKeygenMessage } from '../../keygen/shared/PendingKeygenMessage';
import { KeysignErrorState } from '../shared/KeysignErrorState';
import { CurrentKeysignMsgsProvider } from '../shared/state/currentKeysignMsgs';
import { useKeysignPayload } from '../shared/state/keysignPayload';

export const KeysignMsgsGuard = ({ children }: ComponentWithChildrenProps) => {
  const walletCore = useAssertWalletCore();

  const { t } = useTranslation();

  const payload = useKeysignPayload();

  const { mutate: parse, ...mutationStatus } = useMutation({
    mutationFn: async () => {
      console.log(JSON.stringify(payload.toJson()));
      return KeysignPayloadUtils.getPreKeysignImages(walletCore, payload);
    },
  });

  useEffect(() => parse(), [parse]);

  return (
    <QueryDependant
      query={mutationStatus}
      error={() => <KeysignErrorState title={t('read_msg_failed')} />}
      pending={() => (
        <>
          <PageHeader
            title={<PageHeaderTitle>{t('keysign')}</PageHeaderTitle>}
            primaryControls={<PageHeaderBackButton />}
          />
          <PageContent justifyContent="center" alignItems="center">
            <PendingKeygenMessage>{t('read_msg_failed')}</PendingKeygenMessage>
          </PageContent>
        </>
      )}
      success={value => (
        <CurrentKeysignMsgsProvider value={value}>
          {children}
        </CurrentKeysignMsgsProvider>
      )}
    />
  );
};
