import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ComponentWithBackActionProps,
  ComponentWithForwardActionProps,
} from '../../../lib/ui/props';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { Text } from '../../../lib/ui/text';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { FancyLoader } from '../../../ui/pending/FancyLoader';
import { KeygenFailedState } from '../../keygen/shared/KeygenFailedState';
import { useCurrentSessionId } from '../../keygen/shared/state/currentSessionId';
import { useCurrentLocalPartyId } from '../../keygen/state/currentLocalPartyId';
import { useVaultType } from '../shared/state/vaultType';
import { useCurrentHexChainCode } from '../state/currentHexChainCode';
import { useCurrentHexEncryptionKey } from '../state/currentHexEncryptionKey';
import { useVaultName } from '../state/vaultName';
import { useVaultEmail } from './email/state/email';
import { useVaultPassword } from './password/state/password';
import { setupVaultWithServer } from './utils/setupVaultWithServer';

export const SetupVaultServerStep: React.FC<
  ComponentWithForwardActionProps & ComponentWithBackActionProps
> = ({ onForward, onBack }) => {
  const { t } = useTranslation();
  const type = useVaultType();

  const [name] = useVaultName();
  const [password] = useVaultPassword();
  const [email] = useVaultEmail();
  const sessionId = useCurrentSessionId();
  const hexChainCode = useCurrentHexChainCode();
  const hexEncryptionKey = useCurrentHexEncryptionKey();
  const localPartyId = useCurrentLocalPartyId();

  const { mutate, ...state } = useMutation({
    mutationFn: () =>
      setupVaultWithServer({
        name,
        encryption_password: password,
        session_id: sessionId,
        hex_chain_code: hexChainCode,
        local_party_id: localPartyId,
        email,
        hex_encryption_key: hexEncryptionKey,
      }),
    onSuccess: onForward,
  });

  useEffect(mutate, [mutate]);

  return (
    <>
      <PageHeader
        title={
          <PageHeaderTitle>
            {t('keygen_for_vault', { type: t(type) })}
          </PageHeaderTitle>
        }
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
      />
      <QueryDependant
        query={state}
        pending={() => (
          <PageContent alignItems="center" justifyContent="center">
            <FancyLoader />
            <Text color="contrast" weight="bold" size={16}>
              {t('looking_for_server')}
            </Text>
          </PageContent>
        )}
        success={() => null}
        error={error => (
          <KeygenFailedState message={error.message} onTryAgain={onBack} />
        )}
      />
      <PageContent></PageContent>
    </>
  );
};
