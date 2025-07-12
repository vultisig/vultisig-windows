import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { base64Encode } from '@lib/utils/base64Encode'
import { chainPromises } from '@lib/utils/promise/chainPromises'

import { encodeDERSignature } from '../../derSignature'
import { waitForSetupMessage } from '../../setupMessage/get'
import {
  decodeDecryptMessage,
  encodeEncryptMessage,
} from '../../encodingAndEncryption'
import { getMessageHash } from '../../getMessageHash'
import { markLocalPartyKeysignComplete } from '../../keysignComplete'
import { initializeMpcLib } from '../../lib/initialize'
import { Keyshare } from '../../lib/keyshare'
import { SignSession } from '../../lib/signSession'
import { deleteRelayMessage } from '../../relayMessage/delete'
import { getRelayMessages } from '../../relayMessage/get'
import { sendRelayMessage } from '../../relayMessage/send'
import { sleep } from '../../sleep'
import { uploadSetupMessage } from '../../setupMessage/upload'
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

      let isKeysignComplete = false
      let sequenceNo = 0
      const cache: Record<string, string> = {}

      const processOutbound = async () => {
        while (true) {
          try {
            const message = session.outputMessage()
            if (message === undefined) {
              if (isKeysignComplete) {
                console.log('stop processOutbound')
                return
              } else {
                await sleep(100) // backoff for 100ms
              }
              continue
            }
            console.log('outbound message:', message)
            const messageToSend = await encodeEncryptMessage(
              message.body,
              hexEncryptionKey
            )
            message?.receivers.forEach(receiver => {
              // send message to receiver
              sendRelayMessage({
                serverUrl,
                localPartyId,
                sessionId,
                message: messageToSend,
                to: receiver,
                sequenceNo,
                messageHash: getMessageHash(base64Encode(message.body)),
                messageId: messageHash,
              })
              sequenceNo++
            })
          } catch (error) {
            console.error('processOutbound error:', error)
          }
        }
      }

      const processInbound = async () => {
        const start = Date.now()
        while (true) {
          try {
            const parsedMessages = await getRelayMessages({
              serverUrl,
              localPartyId,
              sessionId,
              messageId: messageHash,
            })
            for (const msg of parsedMessages) {
              const cacheKey = `${msg.session_id}-${msg.from}-${messageHash}-${msg.hash}`
              if (cache[cacheKey]) {
                continue
              }
              console.log(
                `got message from: ${msg.from},to: ${msg.to},key:${cacheKey}`
              )
              const decryptedMessage = await decodeDecryptMessage(
                msg.body,
                hexEncryptionKey
              )
              const isFinish = session.inputMessage(decryptedMessage)
              if (isFinish) {
                isKeysignComplete = true
                console.log('keysign complete')
                return true
              }
              cache[cacheKey] = ''
              await deleteRelayMessage({
                serverUrl,
                localPartyId,
                sessionId,
                messageHash: msg.hash,
                messageId: messageHash,
              })
            }
            const end = Date.now()
            // timeout after 1 minute
            if (end - start > 1000 * 60) {
              console.log('timeout')
              isKeysignComplete = true
              return false
            }
          } catch (error) {
            console.error('processInbound error:', error)
          }
        }
      }

      const [inboundResult] = await Promise.all([
        processInbound(),
        processOutbound(),
      ])
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
