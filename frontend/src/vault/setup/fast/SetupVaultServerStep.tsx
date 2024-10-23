import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ComponentWithBackActionProps,
  ComponentWithForwardActionProps,
} from '../../../lib/ui/props';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
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

  const { mutate } = useMutation({
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
          <PageHeaderTitle>{t('keygen_for_vault', { type })}</PageHeaderTitle>
        }
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
      />
      <PageContent></PageContent>
    </>
  );
};
