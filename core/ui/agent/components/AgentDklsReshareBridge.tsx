import { DKLS } from '@core/mpc/dkls/dkls'
import {
  setKeygenComplete,
  waitForKeygenComplete,
} from '@core/mpc/keygenComplete'
import { Schnorr } from '@core/mpc/schnorr/schnorrKeygen'
import { getVaultId } from '@core/mpc/vault/Vault'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { without } from '@lib/utils/array/without'
import { useEffect } from 'react'

type DklsReshareRequestEvent = {
  requestId: string
  vaultPubKey: string
  sessionId: string
  hexEncryptionKey: string
  relayUrl: string
  localPartyId: string
  peers: string[]
  oldParties: string[]
  ecdsaKeyshare: string
  eddsaKeyshare: string
}

export const AgentDklsReshareBridge = () => {
  const vault = useCurrentVault()
  const currentVaultPubKey = getVaultId(vault)

  useEffect(() => {
    if (!window.runtime) return

    const onDklsReshareRequest = async (data: DklsReshareRequestEvent) => {
      const agentService = window.go?.agent?.AgentService
      if (!agentService || !('ProvideDKLSReshare' in agentService)) {
        return
      }

      try {
        if (data.vaultPubKey !== currentVaultPubKey) {
          await agentService.ProvideDKLSReshare(
            data.requestId,
            '',
            '',
            '',
            '',
            '',
            'DKLS reshare request vault does not match current vault'
          )
          return
        }

        const oldCommittee = data.oldParties.filter(party =>
          data.peers.includes(party)
        )

        const dklsKeygen = new DKLS(
          { reshare: 'plugin' },
          true,
          data.relayUrl,
          data.sessionId,
          data.localPartyId,
          data.peers,
          oldCommittee,
          data.hexEncryptionKey,
          { timeoutMs: 60000 }
        )

        const dklsResult = await dklsKeygen.startReshareWithRetry(
          data.ecdsaKeyshare || undefined
        )

        const schnorrKeygen = new Schnorr(
          { reshare: 'plugin' },
          true,
          data.relayUrl,
          data.sessionId,
          data.localPartyId,
          data.peers,
          oldCommittee,
          data.hexEncryptionKey,
          new Uint8Array(0),
          { timeoutMs: 60000 }
        )

        const schnorrResult = await schnorrKeygen.startReshareWithRetry(
          data.eddsaKeyshare || undefined
        )

        await setKeygenComplete({
          serverURL: data.relayUrl,
          sessionId: data.sessionId,
          localPartyId: data.localPartyId,
        })

        await waitForKeygenComplete({
          serverURL: data.relayUrl,
          sessionId: data.sessionId,
          peers: without(data.peers, data.localPartyId),
        })

        await agentService.ProvideDKLSReshare(
          data.requestId,
          dklsResult.publicKey,
          schnorrResult.publicKey,
          dklsResult.keyshare,
          schnorrResult.keyshare,
          dklsResult.chaincode,
          ''
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        await agentService.ProvideDKLSReshare(
          data.requestId,
          '',
          '',
          '',
          '',
          '',
          message
        )
      }
    }

    return window.runtime.EventsOn(
      'agent:dkls_reshare_request',
      onDklsReshareRequest as (data: unknown) => void
    )
  }, [currentVaultPubKey])

  return null
}
