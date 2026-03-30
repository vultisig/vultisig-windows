import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useEmail } from '@core/ui/state/email'
import { usePassword } from '@core/ui/state/password'
import { useIsTssBatchingEnabled } from '@core/ui/storage/tssBatchingEnabled'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { ChildrenProp } from '@lib/ui/props'
import {
  generateLocalPartyId,
  hasServer,
} from '@vultisig/core-mpc/devices/localPartyId'
import { batchReshareWithServer } from '@vultisig/core-mpc/fast/api/batchReshareWithServer'
import { reshareWithServer } from '@vultisig/core-mpc/fast/api/reshareWithServer'

import { FastKeygenServerActionProvider } from '../fast/state/fastKeygenServerAction'

export const ReshareFastKeygenServerActionProvider = ({
  children,
}: ChildrenProp) => {
  const sessionId = useMpcSessionId()
  const hexEncryptionKey = useCurrentHexEncryptionKey()

  const [password] = usePassword()

  const { name, hexChainCode, publicKeys, resharePrefix, signers } =
    useCurrentVault()

  const [email] = useEmail()
  const isTssBatchingEnabled = useIsTssBatchingEnabled()

  const action = async () => {
    if (isTssBatchingEnabled) {
      await batchReshareWithServer({
        public_key: hasServer(signers) ? publicKeys.ecdsa : undefined,
        session_id: sessionId,
        hex_encryption_key: hexEncryptionKey,
        encryption_password: password,
        email,
        old_parties: signers,
        local_party_id: generateLocalPartyId('server'),
        protocols: ['ecdsa', 'eddsa'],
      })
    } else {
      await reshareWithServer({
        public_key: hasServer(signers) ? publicKeys.ecdsa : undefined,
        session_id: sessionId,
        hex_encryption_key: hexEncryptionKey,
        encryption_password: password,
        email,
        name,
        old_parties: signers,
        hex_chain_code: hexChainCode,
        local_party_id: generateLocalPartyId('server'),
        old_reshare_prefix: resharePrefix ?? '',
      })
    }
  }

  return (
    <FastKeygenServerActionProvider value={action}>
      {children}
    </FastKeygenServerActionProvider>
  )
}
