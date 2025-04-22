import { useStartFastVaultKeygenSessionMutation } from './useStartFastVaultKeygenSessionMutation'
import { useVaultPeersSetup } from './useVaultPeersSetup'
import { useVaultServerSetup } from './useVaultServerSetup'

export const useVaultCreationPreparation = () => {
  const serverSetup = useVaultServerSetup()
  const shouldStartPeerSetup = serverSetup.isSuccess

  const peerSetup = useVaultPeersSetup(shouldStartPeerSetup)
  const shouldStartKeygen = shouldStartPeerSetup && peerSetup.hasPeers

  const keygenSetup = useStartFastVaultKeygenSessionMutation(shouldStartKeygen)

  return {
    isPending: [serverSetup, peerSetup, keygenSetup].some(
      setup => setup.isPending
    ),
    error:
      serverSetup.error || peerSetup.error || keygenSetup.error
        ? {
            serverStepError: serverSetup.error,
            peersStepError: peerSetup.error,
            keygenStepError: keygenSetup.error
              ? keygenSetup.error
              : 'failed_to_start_keygen',
          }
        : null,
    data: keygenSetup.isSuccess ? true : undefined,
  }
}
