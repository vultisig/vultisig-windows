import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { match } from '@lib/utils/match'
import { chainPromises } from '@lib/utils/promise/chainPromises'

import { DKLSKeysign } from '../../dkls/dklsKeysign'
import { initializeMpcLib } from '../../lib/initializeMpcLib'
import { SchnorrKeysign } from '../../schnorr/schnorrKeysign'

type ExecuteKeysignInput = {
  keyShare: string
  signatureAlgorithm: SignatureAlgorithm
  messages: string[]
  chainPath: string
  localPartyId: string
  peers: string[]
  serverUrl: string
  sessionId: string
  hexEncryptionKey: string
  isInitiateDevice: boolean
}

export const executeKeysign = async ({
  keyShare,
  signatureAlgorithm,
  messages,
  chainPath,
  localPartyId,
  peers,
  serverUrl,
  sessionId,
  hexEncryptionKey,
  isInitiateDevice,
}: ExecuteKeysignInput) => {
  await initializeMpcLib(signatureAlgorithm)

  const instance = match<SignatureAlgorithm, DKLSKeysign | SchnorrKeysign>(
    signatureAlgorithm,
    {
      ecdsa: () =>
        new DKLSKeysign(
          serverUrl,
          localPartyId,
          sessionId,
          hexEncryptionKey,
          chainPath,
          [...peers, localPartyId],
          isInitiateDevice,
          keyShare
        ),
      eddsa: () =>
        new SchnorrKeysign(
          serverUrl,
          localPartyId,
          sessionId,
          hexEncryptionKey,
          'm', // chainPath is only used for ECDSA right now , pass 'm' as a dummy value
          [...peers, localPartyId],
          isInitiateDevice,
          keyShare
        ),
    }
  )

  return chainPromises(
    messages.map(message => () => instance.keysignWithRetry(message))
  )
}
