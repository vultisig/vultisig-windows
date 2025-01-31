import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';

import { setupVaultWithServer } from '../../../fast/api/setupVaultWithServer';
import { useCurrentSessionId } from '../../../keygen/shared/state/currentSessionId';
import { generateLocalPartyId } from '../../../keygen/utils/localPartyId';
import { useVaultEmail } from '../../../server/email/state/email';
import { useVaultPassword } from '../../../server/password/state/password';
import { useCurrentHexChainCode } from '../../state/currentHexChainCode';
import { useCurrentHexEncryptionKey } from '../../state/currentHexEncryptionKey';
import { useVaultName } from '../../state/vaultName';

export const useVaultServerSetup = () => {
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
  });

  useEffect(mutate, [mutate]);

  return state;
};
