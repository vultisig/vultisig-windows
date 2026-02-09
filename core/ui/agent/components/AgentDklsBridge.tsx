import { keysign } from '@core/mpc/keysign'
import { getVaultId } from '@core/mpc/vault/Vault'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useEffect } from 'react'

type DklsSignRequestEvent = {
  requestId: string
  vaultPubKey: string
  message: string
  derivePath: string
  sessionId: string
  hexEncryptionKey: string
  relayUrl: string
  localPartyId: string
  peers: string[]
  keyShare: string
  signatureAlgorithm?: 'ecdsa' | 'eddsa'
}

export const AgentDklsBridge = () => {
  const vault = useCurrentVault()
  const currentVaultPubKey = getVaultId(vault)

  useEffect(() => {
    if (!window.runtime) return

    const onDklsSignRequest = async (data: DklsSignRequestEvent) => {
      const agentService = window.go?.agent?.AgentService
      if (!agentService || !('ProvideDKLSSignature' in agentService)) {
        return
      }

      try {
        if (data.vaultPubKey !== currentVaultPubKey) {
          await agentService.ProvideDKLSSignature(
            data.requestId,
            '',
            '',
            '',
            'DKLS signing request vault does not match current vault'
          )
          return
        }

        const result = await keysign({
          keyShare: data.keyShare,
          signatureAlgorithm: data.signatureAlgorithm ?? 'ecdsa',
          message: data.message,
          chainPath: data.derivePath.replaceAll("'", ''),
          localPartyId: data.localPartyId,
          peers: data.peers || [],
          serverUrl: data.relayUrl,
          sessionId: data.sessionId,
          hexEncryptionKey: data.hexEncryptionKey,
          isInitiatingDevice: true,
        })

        await agentService.ProvideDKLSSignature(
          data.requestId,
          result.r,
          result.s,
          result.recovery_id ?? '',
          ''
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        await agentService.ProvideDKLSSignature(
          data.requestId,
          '',
          '',
          '',
          message
        )
      }
    }

    return window.runtime.EventsOn(
      'agent:dkls_sign_request',
      onDklsSignRequest as (data: unknown) => void
    )
  }, [currentVaultPubKey])

  return null
}
