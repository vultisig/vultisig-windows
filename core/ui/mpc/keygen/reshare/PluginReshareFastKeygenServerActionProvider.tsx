import { generateLocalPartyId, hasServer } from '@core/mpc/devices/localPartyId'
import { createSession } from '@core/mpc/fast/api/createSession'
import { reshareWithServer } from '@core/mpc/fast/api/reshareWithServer'
import { reshareWithVerifier } from '@core/mpc/fast/api/reshareWithVerifier'
import { toLibType } from '@core/mpc/types/utils/libType'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { usePassword } from '@core/ui/state/password'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { ChildrenProp } from '@lib/ui/props'
import { useCallback } from 'react'

import { FastKeygenServerActionProvider } from '../fast/state/fastKeygenServerAction'

export const PluginReshareFastKeygenServerActionProvider = ({
  children,
  pluginId,
}: ChildrenProp & { pluginId: string }) => {
  const sessionId = useMpcSessionId()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  console.log('hexEncryptionKey', hexEncryptionKey)
  console.log('sessionId', sessionId)

  const [password] = usePassword()
  console.log('password', password)
  const {
    name,
    hexChainCode,
    publicKeys,
    resharePrefix,
    signers,
    libType,
    chainPublicKeys,
    localPartyId,
  } = useCurrentVault()

  const action = useCallback(async () => {
    const extensionParty = signers.find(s => s.startsWith('extension'))
    if (!extensionParty) {
      throw new Error('Extension party not found')
    }
    console.log('creating session for', extensionParty)
    await createSession({ sessionId, extensionParty })
    console.log('extensionParty created', extensionParty)
    await reshareWithServer({
      public_key: hasServer(signers) ? publicKeys.ecdsa : undefined,
      session_id: sessionId,
      hex_encryption_key: hexEncryptionKey,
      encryption_password: password,
      name,
      old_parties: signers,
      hex_chain_code: hexChainCode,
      local_party_id: generateLocalPartyId('server'),
      old_reshare_prefix: resharePrefix ?? '',
      lib_type: toLibType({
        libType,
        chainPublicKeys,
      }),
      reshare_type: 1,
    })
    await reshareWithVerifier({
      email: '',
      hex_chain_code: hexChainCode,
      hex_encryption_key: hexEncryptionKey,
      local_party_id: localPartyId,
      name,
      old_parties: signers as string[],
      plugin_id: pluginId,
      public_key: publicKeys.ecdsa,
      session_id: sessionId,
    })
  }, [
    hexChainCode,
    hexEncryptionKey,
    localPartyId,
    name,
    password,
    pluginId,
    publicKeys.ecdsa,
    resharePrefix,
    sessionId,
    signers,
    libType,
    chainPublicKeys,
  ])

  return (
    <FastKeygenServerActionProvider value={action}>
      {children}
    </FastKeygenServerActionProvider>
  )
}
