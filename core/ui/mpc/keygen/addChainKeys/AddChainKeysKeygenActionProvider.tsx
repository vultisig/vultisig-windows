import { Chain } from '@core/chain/Chain'
import { getChainHeight } from '@core/chain/chains/monero/daemonRpc'
import { getLatestBlock } from '@core/chain/chains/zcash/lightwalletd/client'
import { parseFromtBundleResult } from '@core/mpc/fromt/fromtSession'
import { createFromtKeygenSession } from '@core/mpc/fromt/fromtSessionFactory'
import {
  parseFroztBundleResult,
  runFroztSession,
} from '@core/mpc/frozt/froztSession'
import { createFroztKeygenSession } from '@core/mpc/frozt/froztSessionFactory'
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

        let moneroBirthday = 0
        try {
          moneroBirthday = await getChainHeight()
        } catch {
          // monero daemon unavailable, use 0
        }

        const fromtSession = await createFromtKeygenSession({
          serverUrl,
          sessionId,
          localPartyId,
          hexEncryptionKey: encryptionKeyHex,
          setupMessageId: 'fromt',
          isInitiatingDevice,
          signers,
          birthday: moneroBirthday,
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

      const latestBlock = await getLatestBlock()
      const froztSession = await createFroztKeygenSession({
        serverUrl,
        sessionId,
        localPartyId,
        hexEncryptionKey: encryptionKeyHex,
        setupMessageId: 'frozt',
        isInitiatingDevice,
        signers,
        birthday: latestBlock.height,
      })

      const froztBundle = await runFroztSession({
        session: froztSession,
        messageId: 'p-frozt',
        serverUrl,
        sessionId,
        localPartyId,
        signers,
        hexEncryptionKey: encryptionKeyHex,
      })

      const froztResult = parseFroztBundleResult(froztBundle)

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
          [Chain.ZcashSapling]: froztResult.pubKeyPackage,
        },
        chainKeyShares: {
          ...existingVault.chainKeyShares,
          [Chain.ZcashSapling]: froztResult.bundle,
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
