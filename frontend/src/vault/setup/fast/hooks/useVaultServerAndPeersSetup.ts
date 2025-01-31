import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { isEmpty } from '../../../../lib/utils/array/isEmpty';
import { recordFromKeys } from '../../../../lib/utils/record/recordFromKeys';
import { setupVaultWithServer } from '../../../fast/api/setupVaultWithServer';
import { usePeerOptionsQuery } from '../../../keygen/shared/peerDiscovery/queries/usePeerOptionsQuery';
import { useCurrentSessionId } from '../../../keygen/shared/state/currentSessionId';
import { generateLocalPartyId } from '../../../keygen/utils/localPartyId';
import { usePeersSelectionRecord } from '../../../keysign/shared/state/selectedPeers';
import { useVaultEmail } from '../../../server/email/state/email';
import { useVaultPassword } from '../../../server/password/state/password';
import { useVaultPasswordHint } from '../../../server/password-hint/state/password-hint';
import { useCurrentHexChainCode } from '../../state/currentHexChainCode';
import { useCurrentHexEncryptionKey } from '../../state/currentHexEncryptionKey';
import { useVaultName } from '../../state/vaultName';

export const useVaultServerAndPeersSetup = () => {
  const [serverSetupComplete, setServerSetupComplete] = useState(false);
  const [name] = useVaultName();
  const [password] = useVaultPassword();
  const [email] = useVaultEmail();
  // TODO: check what we're going to do with this with team (hint)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [passwordHint] = useVaultPasswordHint();
  const sessionId = useCurrentSessionId();
  const hexChainCode = useCurrentHexChainCode();
  const hexEncryptionKey = useCurrentHexEncryptionKey();
  const peerOptionsQuery = usePeerOptionsQuery({
    enabled: serverSetupComplete,
  });

  const [peers, setPeers] = usePeersSelectionRecord();

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
    onSuccess: () => setServerSetupComplete(true),
  });

  useEffect(mutate, [mutate]);

  useEffect(() => {
    if (
      serverSetupComplete &&
      peerOptionsQuery.data &&
      !isEmpty(peerOptionsQuery.data)
    ) {
      setPeers(recordFromKeys(peerOptionsQuery.data, () => true));
    }
  }, [serverSetupComplete, peerOptionsQuery.data, setPeers]);

  return {
    isPending: !serverSetupComplete || Object.values(peers).length === 0,
    error:
      state.error || peerOptionsQuery.error
        ? {
            serverStepError: state.error,
            peersStepError: peerOptionsQuery.error,
          }
        : null,
    data:
      Object.values(peers).length > 0 && serverSetupComplete ? true : undefined,
  };
};
