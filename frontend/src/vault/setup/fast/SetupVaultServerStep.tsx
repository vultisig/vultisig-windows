import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ComponentWithBackActionProps,
  ComponentWithForwardActionProps,
} from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { setupVaultWithServer } from '../../fast/api/setupVaultWithServer';
import { KeygenFailedState } from '../../keygen/shared/KeygenFailedState';
import { useCurrentSessionId } from '../../keygen/shared/state/currentSessionId';
import { generateLocalPartyId } from '../../keygen/utils/localPartyId';
import { WaitForServerLoader } from '../../server/components/WaitForServerLoader';
import { useVaultEmail } from '../../server/email/state/email';
import { useVaultPassword } from '../../server/password/state/password';
import { useVaultType } from '../shared/state/vaultType';
import { useCurrentHexChainCode } from '../state/currentHexChainCode';
import { useCurrentHexEncryptionKey } from '../state/currentHexEncryptionKey';
import { useVaultName } from '../state/vaultName';

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

  const { mutate, ...state } = useMutation({
    mutationFn: () =>
      setupVaultWithServer({
        name,
        encryption_password: password,
        session_id: sessionId,
        hex_chain_code: hexChainCode,
        local_party_id: generateLocalPartyId('server'),
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
      <MatchQuery
        value={state}
        pending={() => <WaitForServerLoader />}
        success={() => null}
        error={error => (
          <KeygenFailedState message={error.message} onTryAgain={onBack} />
        )}
      />
    </>
  );
};
