import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { match } from '@lib/utils/match'
import { chainPromises } from '@lib/utils/promise/chainPromises'
import { retry } from '@lib/utils/query/retry'

import { DKLSKeysign } from '../../dkls/dklsKeysign'
import { waitForSetupMessage } from '../../downloadSetupMessage'
import {
  decodeDecryptMessage,
  encodeEncryptMessage,
} from '../../encodingAndEncryption'
import { getMessageHash } from '../../getMessageHash'
import { initializeMpcLib } from '../../lib/initialize'
import { Keyshare } from '../../lib/keyshare'
import { SignSession } from '../../lib/signSession'
import { SchnorrKeysign } from '../../schnorr/schnorrKeysign'
import { uploadSetupMessage } from '../../uploadSetupMessage'

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
        new DKLSKeysign(
          serverUrl,
          localPartyId,
          sessionId,
          hexEncryptionKey,
          chainPath,
          [...peers, localPartyId],
          isInitiatingDevice,
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
          isInitiatingDevice,
          keyShare
        ),
    }
  )

  return chainPromises(
    messages.map(
      message => () =>
        retry({
          func: async () => {
            const getSetupMessage = async () => {
              const messageHash = getMessageHash(message)
              if (isInitiatingDevice) {
                const setupMessage = SignSession[signatureAlgorithm].setup(
                  Keyshare[signatureAlgorithm]
                    .fromBytes(Buffer.from(keyShare, 'base64'))
                    .keyId(),
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
                serverURL: serverUrl,
                sessionId,
                messageId: messageHash,
              })
              return decodeDecryptMessage(
                encodedEncryptedSetupMsg,
                hexEncryptionKey
              )
            }

            const setupMessage = await getSetupMessage()

            return instance.KeysignOneMessage(message, setupMessage)
          },
          attempts: 3,
        })
    )
  )
}
