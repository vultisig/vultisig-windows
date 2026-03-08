import { Chain } from '@core/chain/Chain'
import { getLatestBlock } from '@core/chain/chains/zcash/lightwalletd/client'
import { parseFromtBundleResult } from '@core/mpc/fromt/fromtSession'
import { createFromtKeygenSession } from '@core/mpc/fromt/fromtSessionFactory'
import { Frozt } from '@core/mpc/frozt/frozt'
import { runFroztSession } from '@core/mpc/frozt/froztSession'
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

import { useKeygenOperation } from '../state/currentKeygenOperationType'
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
  const operation = useKeygenOperation()

  const keyGroup =
    'addChainKeys' in operation ? operation.addChainKeys : 'frozt'

  const keygenAction: KeygenAction = useCallback(
    async ({ onStepChange, signers }) => {
      if (keyGroup === 'fromt') {
        onStepChange('fromt')

        const fromtSession = await createFromtKeygenSession({
          serverUrl,
          sessionId,
          localPartyId,
          hexEncryptionKey: encryptionKeyHex,
          setupMessageId: 'fromt',
          isInitiatingDevice,
          signers,
          birthday: 0,
        })

        const fromtBundle = await runFroztSession({
          session: fromtSession,
          messageId: 'p-fromt',
          serverUrl,
          sessionId,
          localPartyId,
          signers,
          hexEncryptionKey: encryptionKeyHex,
        })

        const fromtResult = parseFromtBundleResult(fromtBundle)

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
            [Chain.Monero]: fromtResult.pubKey,
          },
          chainKeyShares: {
            ...existingVault.chainKeyShares,
            [Chain.Monero]: fromtResult.keyShare,
          },
        }
      }

      onStepChange('frozt')

      const froztKeygen = new Frozt(
        isInitiatingDevice,
        serverUrl,
        sessionId,
        localPartyId,
        signers,
        encryptionKeyHex
      )
      const latestBlock = await getLatestBlock()
      const froztResult = await froztKeygen.startKeygenWithRetry(
        latestBlock.height
      )

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
          [Chain.ZcashShielded]: froztResult.pubKeyPackage,
        },
        chainKeyShares: {
          ...existingVault.chainKeyShares,
          [Chain.ZcashShielded]: froztResult.bundle,
        },
        saplingExtras: froztResult.saplingExtras || undefined,
      }
    },
    [
      encryptionKeyHex,
      existingVault,
      isInitiatingDevice,
      keyGroup,
      localPartyId,
      serverUrl,
      sessionId,
    ]
  )

  return (
    <KeygenActionProvider value={keygenAction}>{children}</KeygenActionProvider>
  )
}
