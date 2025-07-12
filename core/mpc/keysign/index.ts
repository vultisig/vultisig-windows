import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { encodeDERSignature } from '@core/mpc/derSignature'
import {
  decodeDecryptMessage,
  encodeEncryptMessage,
} from '@core/mpc/encodingAndEncryption'
import { getMessageHash } from '@core/mpc/getMessageHash'
import { KeysignSignature } from '@core/mpc/keysign/KeysignSignature'
import { markLocalPartyKeysignComplete } from '@core/mpc/keysignComplete'
import { initializeMpcLib } from '@core/mpc/lib/initialize'
import { Keyshare } from '@core/mpc/lib/keyshare'
import { SignSession } from '@core/mpc/lib/signSession'
import { deleteRelayMessage } from '@core/mpc/relayMessage/delete'
import { getRelayMessages } from '@core/mpc/relayMessage/get'
import { sendRelayMessage } from '@core/mpc/relayMessage/send'
import { waitForSetupMessage } from '@core/mpc/setupMessage/get'
import { uploadSetupMessage } from '@core/mpc/setupMessage/upload'
import { sleep } from '@core/mpc/sleep'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { base64Encode } from '@lib/utils/base64Encode'

type KeysignInput = {
  keyShare: string
  signatureAlgorithm: SignatureAlgorithm
  message: string
  chainPath: string
  localPartyId: string
  peers: string[]
  serverUrl: string
  sessionId: string
  hexEncryptionKey: string
  isInitiatingDevice: boolean
}

export const keysign = async ({
  keyShare,
  signatureAlgorithm,
  message,
  chainPath,
  localPartyId,
  peers,
  serverUrl,
  sessionId,
  hexEncryptionKey,
  isInitiatingDevice,
}: KeysignInput) => {
  await initializeMpcLib(signatureAlgorithm)

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
  const session = new SignSession[signatureAlgorithm](
    setupMessage,
    localPartyId,
    mpcLibKeyshare
  )

  let isKeysignComplete = false

  const processOutbound = async () => {
    let sequenceNo = 0
    while (true) {
      try {
        const message = session.outputMessage()
        if (message === undefined) {
          if (isKeysignComplete) {
            return
          } else {
            await sleep(100)
          }
          continue
        }
        const messageToSend = await encodeEncryptMessage(
          message.body,
          hexEncryptionKey
        )
        message?.receivers.forEach(receiver => {
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
    const cache: Record<string, string> = {}
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
          const decryptedMessage = await decodeDecryptMessage(
            msg.body,
            hexEncryptionKey
          )
          const isFinish = session.inputMessage(decryptedMessage)
          if (isFinish) {
            isKeysignComplete = true
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
        if (end - start > 1000 * 60) {
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
}
