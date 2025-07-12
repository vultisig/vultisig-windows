import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { encodeDERSignature } from '@core/mpc/derSignature'
import {
  decodeDecryptMessage,
  encodeEncryptMessage,
} from '@core/mpc/encodingAndEncryption'
import { getMessageHash } from '@core/mpc/getMessageHash'
import { KeysignSignature } from '@core/mpc/keysign/KeysignSignature'
import { markLocalPartyKeysignComplete } from '@core/mpc/keysignComplete'
import { Keyshare } from '@core/mpc/lib/keyshare'
import { SignSession } from '@core/mpc/lib/signSession'
import { deleteRelayMessage } from '@core/mpc/relayMessage/delete'
import { getRelayMessages } from '@core/mpc/relayMessage/get'
import { sendRelayMessage } from '@core/mpc/relayMessage/send'
import { waitForSetupMessage } from '@core/mpc/setupMessage/get'
import { uploadSetupMessage } from '@core/mpc/setupMessage/upload'
import { sleep } from '@core/mpc/sleep'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { attempt } from '@lib/utils/attempt'
import { base64Encode } from '@lib/utils/base64Encode'
import { Minutes } from '@lib/utils/time'
import { convertDuration } from '@lib/utils/time/convertDuration'

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

const maxInboundWaitTime: Minutes = 1

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

  const { signal, abort } = new AbortController()

  const processOutbound = async (sequenceNo = 0): Promise<void> => {
    if (signal.aborted) {
      return
    }

    const message = session.outputMessage()
    if (!message) {
      await sleep(100)
      return processOutbound(sequenceNo)
    }

    const { body, receivers } = message

    const messageToSend = await encodeEncryptMessage(body, hexEncryptionKey)

    await attempt(
      Promise.all(
        receivers.map((receiver, index) =>
          sendRelayMessage({
            serverUrl,
            localPartyId,
            sessionId,
            message: messageToSend,
            to: receiver,
            sequenceNo: sequenceNo + index,
            messageHash: getMessageHash(base64Encode(body)),
            messageId: messageHash,
          })
        )
      )
    )

    return processOutbound(sequenceNo + receivers.length)
  }

  const processInbound = async (): Promise<void> => {
    if (signal.aborted) {
      throw new Error(
        `Exited inbound processing due to a timeout after ${maxInboundWaitTime} min`
      )
    }

    const relayMessages = await getRelayMessages({
      serverUrl,
      localPartyId,
      sessionId,
      messageId: messageHash,
    })

    for (const msg of relayMessages) {
      const decryptedMessage = await decodeDecryptMessage(
        msg.body,
        hexEncryptionKey
      )
      if (session.inputMessage(decryptedMessage)) {
        return
      }
      await attempt(
        deleteRelayMessage({
          serverUrl,
          localPartyId,
          sessionId,
          messageHash: msg.hash,
          messageId: messageHash,
        })
      )
    }
  }

  const outboundPromise = processOutbound()

  const timeout = setTimeout(
    abort,
    convertDuration(maxInboundWaitTime, 'min', 's')
  )
  const inboundResult = await attempt(processInbound())

  await attempt(outboundPromise)
  clearTimeout(timeout)

  if ('error' in inboundResult) {
    throw new Error('failed to sign message')
  }

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
