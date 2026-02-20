import { generateLocalPartyId, hasServer } from '@core/mpc/devices/localPartyId'
import { reshareWithServer } from '@core/mpc/fast/api/reshareWithServer'
import { toLibType } from '@core/mpc/types/utils/libType'
import { FastKeygenServerActionProvider } from '@core/ui/mpc/keygen/fast/state/fastKeygenServerAction'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { usePassword } from '@core/ui/state/password'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { ChildrenProp } from '@lib/ui/props'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { useCallback } from 'react'

import { verifierUrl } from '../state/chatConfig'
import { useChatPluginInstall } from './ChatPluginInstallContext'

export const ChatPluginReshareServerActionProvider = ({
  children,
}: ChildrenProp) => {
  const sessionId = useMpcSessionId()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const { accessToken, pluginId } = useChatPluginInstall()

  const [password] = usePassword()

  const {
    name,
    hexChainCode,
    publicKeys,
    resharePrefix,
    signers,
    libType,
    chainPublicKeys,
  } = useCurrentVault()

  const action = useCallback(async () => {
    const localPartyId = generateLocalPartyId('server')
    const publicKey = hasServer(signers) ? publicKeys.ecdsa : undefined

    // Call the verifier (with auth) to notify the plugin server and
    // enqueue verifier worker task (joins relay as "verifier-XXXX")
    await queryUrl(`${verifierUrl}/vault/reshare`, {
      body: {
        name,
        public_key: publicKey,
        session_id: sessionId,
        hex_encryption_key: hexEncryptionKey,
        hex_chain_code: hexChainCode,
        local_party_id: localPartyId,
        old_parties: signers,
        email: '',
        plugin_id: pluginId,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: 'none',
    })

    // Call the fast vault server (no auth) so it joins the relay
    // as "Server-XXXX" — required by WaitForPluginAndVerifier
    await reshareWithServer({
      public_key: publicKey,
      session_id: sessionId,
      hex_encryption_key: hexEncryptionKey,
      encryption_password: password,
      name,
      old_parties: signers,
      hex_chain_code: hexChainCode,
      local_party_id: localPartyId,
      old_reshare_prefix: resharePrefix ?? '',
      lib_type: toLibType({
        libType,
        chainPublicKeys,
      }),
      reshare_type: 1,
    })
  }, [
    accessToken,
    chainPublicKeys,
    hexChainCode,
    hexEncryptionKey,
    libType,
    name,
    password,
    pluginId,
    publicKeys.ecdsa,
    resharePrefix,
    sessionId,
    signers,
  ])

  return (
    <FastKeygenServerActionProvider value={action}>
      {children}
    </FastKeygenServerActionProvider>
  )
}
