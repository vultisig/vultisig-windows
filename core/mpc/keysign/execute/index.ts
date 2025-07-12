import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { match } from '@lib/utils/match'
import { chainPromises } from '@lib/utils/promise/chainPromises'

import { encodeDERSignature } from '../../derSignature'
import { DKLSKeysign } from '../../dkls/dklsKeysign'
import { waitForSetupMessage } from '../../downloadSetupMessage'
import {
  decodeDecryptMessage,
  encodeEncryptMessage,
} from '../../encodingAndEncryption'
import { getMessageHash } from '../../getMessageHash'
import { markLocalPartyKeysignComplete } from '../../keysignComplete'
import { initializeMpcLib } from '../../lib/initialize'
import { Keyshare } from '../../lib/keyshare'
import { SignSession } from '../../lib/signSession'
import { SchnorrKeysign } from '../../schnorr/schnorrKeysign'
import { uploadSetupMessage } from '../../uploadSetupMessage'
import { KeysignSignature } from '../KeysignSignature'

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
  isInitiatingDevice: boolean
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
  isInitiatingDevice,
}: ExecuteKeysignInput) => {
  await initializeMpcLib(signatureAlgorithm)

  const instance = match<SignatureAlgorithm, DKLSKeysign | SchnorrKeysign>(
    signatureAlgorithm,
    {
      ecdsa: () =>
        new DKLSKeysign(serverUrl, localPartyId, sessionId, hexEncryptionKey),
      eddsa: () =>
        new SchnorrKeysign(
          serverUrl,
          localPartyId,
          sessionId,
          hexEncryptionKey
        ),
    }
  )

  return chainPromises(
    messages.map(message => async () => {
      const messageHash = getMessageHash(message)

      const mpcLibKeyshare = Keyshare[signatureAlgorithm].fromBytes(
        Buffer.from(keyShare, 'base64')
      )

      const getSetupMessage = async () => {
        if (isInitiatingDevice) {
          const setupMessage = SignSession[signatureAlgorithm].setup(
            mpcLibKeyshare.keyId(),
            chainPath,
            Buffer.from(message, 'hex'),
            [...peers, localPartyId]
          )
          const encryptedSetupMessage = await encodeEncryptMessage(
            setupMessage,
            hexEncryptionKey
          )
          await uploadSetupMessage({
            serverUrl,
            sessionId,
            message: encryptedSetupMessage,
            messageId: messageHash,
          })

          return setupMessage
        }

        const encodedEncryptedSetupMsg = await waitForSetupMessage({
          serverUrl,
          sessionId,
          messageId: messageHash,
        })
        return decodeDecryptMessage(encodedEncryptedSetupMsg, hexEncryptionKey)
      }

      const setupMessage = await getSetupMessage()

      const signMsgHash = shouldBePresent(
        SignSession[signatureAlgorithm].setupMessageHash(setupMessage)
      )

      const hexSignMsgHash = Buffer.from(signMsgHash).toString('hex')
      if (message != hexSignMsgHash) {
        throw new Error('message hash not match')
      }
      // good to sign
      const session = new SignSession[signatureAlgorithm](
        setupMessage,
        localPartyId,
        mpcLibKeyshare
      )
      const outbound = instance.processOutbound(session, messageHash)
      const inbound = instance.processInbound(session, messageHash)
      const [, inboundResult] = await Promise.all([outbound, inbound])
      if (inboundResult) {
        const signature = session.finish()
        const r = signature.slice(0, 32)
        const s = signature.slice(32, 64)
        const recoveryId = signature[64]
        const derSignature = encodeDERSignature(r, s)
        const keysignSig: KeysignSignature = {
          msg: Buffer.from(message, 'hex').toString('base64'),
          r: Buffer.from(r).toString('hex'),
          s: Buffer.from(s).toString('hex'),
          recovery_id: recoveryId.toString(16).padStart(2, '0'),
          der_signature: Buffer.from(derSignature).toString('hex'),
        }
        await markLocalPartyKeysignComplete({
          serverUrl,
          sessionId,
          messageId: messageHash,
          jsonSignature: JSON.stringify(keysignSig),
        })
        return keysignSig
      }

      throw new Error('failed to sign message')
    })
  )
}
