import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { match } from '@lib/utils/match'

import { DKLSKeysign } from '../../dkls/dklsKeysign'
import { SchnorrKeysign } from '../../schnorr/schnorrKeysign'

type ExecuteKeysignInput = {
  keyShare: string
  signatureAlgorithm: SignatureAlgorithm
  messages: string[]
  publicKey: string
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
  publicKey,
  chainPath,
  localPartyId,
  peers,
  serverUrl,
  sessionId,
  hexEncryptionKey,
  isInitiateDevice,
}: ExecuteKeysignInput) => {
  return match(signatureAlgorithm, {
    ecdsa: () => {
      const dklsKeysign = new DKLSKeysign(
        serverUrl,
        localPartyId,
        sessionId,
        hexEncryptionKey,
        publicKey,
        chainPath,
        [...peers, localPartyId],
        isInitiateDevice,
        keyShare
      )
      return dklsKeysign.startKeysign(messages)
    },
    eddsa: () => {
      const schnorrKeysign = new SchnorrKeysign(
        serverUrl,
        localPartyId,
        sessionId,
        hexEncryptionKey,
        publicKey,
        'm', // chainPath is only used for ECDSA right now , pass 'm' as a dummy value
        [...peers, localPartyId],
        isInitiateDevice,
        keyShare
      )
      return schnorrKeysign.startKeysign(messages)
    },
  })
}
