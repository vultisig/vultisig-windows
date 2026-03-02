import { Chain } from '@core/chain/Chain'
import { saveBirthHeight } from '@core/chain/chains/zcash/birthHeight'
import { getZcashZAddress } from '@core/chain/chains/zcash/getZcashZAddress'
import { getLatestBlock } from '@core/chain/chains/zcash/lightwalletd/client'
import { saveScannerKeys } from '@core/chain/chains/zcash/scannerKeys'
import { Frozt } from '@core/mpc/frozt/frozt'
import {
  setKeygenComplete,
  waitForKeygenComplete,
} from '@core/mpc/keygenComplete'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useIsInitiatingDevice } from '@core/ui/mpc/state/isInitiatingDevice'
import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { ChildrenProp } from '@lib/ui/props'
import { without } from '@lib/utils/array/without'
import { useCallback } from 'react'

import { KeygenAction, KeygenActionProvider } from '../state/keygenAction'

export const AddChainKeysKeygenActionProvider = ({
  children,
}: ChildrenProp) => {
  const serverUrl = useMpcServerUrl()
  const encryptionKeyHex = useCurrentHexEncryptionKey()
  const sessionId = useMpcSessionId()
  const localPartyId = useMpcLocalPartyId()
  const isInitiatingDevice = useIsInitiatingDevice()
  const existingVault = useCurrentVault()

  const keygenAction: KeygenAction = useCallback(
    async ({ onStepChange, signers }) => {
      onStepChange('frozt')

      const froztKeygen = new Frozt(
        isInitiatingDevice,
        serverUrl,
        sessionId,
        localPartyId,
        signers,
        encryptionKeyHex
      )
      const froztResult = await froztKeygen.startKeygenWithRetry()

      try {
        const zAddress = await getZcashZAddress(
          froztResult.pubKeyPackage,
          froztResult.saplingExtras
        )
        saveScannerKeys(
          zAddress,
          froztResult.pubKeyPackage,
          froztResult.saplingExtras
        )
        const latestBlock = await getLatestBlock()
        saveBirthHeight(zAddress, latestBlock.height)
      } catch {
        // non-critical: don't fail keygen if lightwalletd is unreachable
      }

      await setKeygenComplete({
        serverURL: serverUrl,
        sessionId,
        localPartyId,
      })

      await waitForKeygenComplete({
        serverURL: serverUrl,
        sessionId,
        peers: without(signers, localPartyId),
      })

      return {
        ...existingVault,
        signers,
        chainPublicKeys: {
          ...existingVault.chainPublicKeys,
          [Chain.Zcash]: froztResult.pubKeyPackage,
          [Chain.ZcashShielded]: froztResult.pubKeyPackage,
        },
        chainKeyShares: {
          ...existingVault.chainKeyShares,
          [Chain.Zcash]: froztResult.keyshare,
          [Chain.ZcashShielded]: froztResult.keyshare,
        },
        saplingExtras: froztResult.saplingExtras || undefined,
      }
    },
    [
      encryptionKeyHex,
      existingVault,
      isInitiatingDevice,
      localPartyId,
      serverUrl,
      sessionId,
    ]
  )

  return (
    <KeygenActionProvider value={keygenAction}>{children}</KeygenActionProvider>
  )
}
