import { useVaultPeersSetup } from './useVaultPeersSetup';
import { useVaultServerSetup } from './useVaultServerSetup';

export const useVaultCreationPreparation = () => {
  const serverSetup = useVaultServerSetup();
  const peerSetup = useVaultPeersSetup(serverSetup.isSuccess);

  return {
    isPending: serverSetup.isPending || peerSetup.isPending,
    error:
      serverSetup.error || peerSetup.error
        ? {
            serverStepError: serverSetup.error,
            peersStepError: peerSetup.error,
          }
        : null,
    data: peerSetup.hasPeers && serverSetup.isSuccess ? true : undefined,
  };
};
