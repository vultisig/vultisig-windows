import { useMutation } from '@tanstack/react-query';

import { Reshare, StartKeygen } from '../../../../../wailsjs/go/tss/TssService';
import { match } from '../../../../lib/utils/match';
import { useSaveVaultMutation } from '../../../mutations/useSaveVaultMutation';
import { useCurrentHexEncryptionKey } from '../../../setup/state/currentHexEncryptionKey';
import { KeygenType } from '../../KeygenType';
import { useCurrentKeygenType } from '../../state/currentKeygenType';
import { useCurrentKeygenVault } from '../../state/currentKeygenVault';
import { useCurrentServerUrl } from '../../state/currentServerUrl';
import { useCurrentSessionId } from '../state/currentSessionId';

export const useKeygenMutation = () => {
  const keygenType = useCurrentKeygenType();

  const serverUrl = useCurrentServerUrl();

  const encryptionKeyHex = useCurrentHexEncryptionKey();

  const sessionId = useCurrentSessionId();

  const vault = useCurrentKeygenVault();

  const { mutateAsync: saveVault } = useSaveVaultMutation();

  return useMutation({
    mutationFn: async () => {
      const newVault = await match(keygenType, {
        [KeygenType.Keygen]: () =>
          StartKeygen(
            vault.name,
            vault.local_party_id,
            sessionId,
            vault.hex_chain_code,
            encryptionKeyHex,
            serverUrl
          ),
        [KeygenType.Reshare]: () =>
          Reshare(vault, sessionId, encryptionKeyHex, serverUrl),
      });

      await saveVault(newVault);

      return newVault;
    },
  });
};
