import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { encodeDERSignature } from '@core/mpc/derSignature'
import { getMessageHash } from '@core/mpc/getMessageHash'
import { KeysignSignature } from '@core/mpc/keysign/KeysignSignature'
import { markLocalPartyKeysignComplete } from '@core/mpc/keysignComplete'
import { SignSession } from '@core/mpc/lib/signSession'
import { sleep } from '@core/mpc/sleep'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { attempt } from '@lib/utils/attempt'
import { base64Encode } from '@lib/utils/base64Encode'
import { Minutes } from '@lib/utils/time'
import { convertDuration } from '@lib/utils/time/convertDuration'

import { toMpcLibKeyshare } from '../lib/keyshare'
import { deleteMpcRelayMessage } from '../message/relay/delete'
import { getMpcRelayMessages } from '../message/relay/get'
import { sendMpcRelayMessage } from '../message/relay/send'
import { fromMpcServerMessage, toMpcServerMessage } from '../message/server'
import { waitForSetupMessage } from '../message/setup/get'
import { uploadMpcSetupMessage } from '../message/setup/upload'
import { makeSetupMessage } from './setupMessage/make'

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
  const messageId = getMessageHash(message)

  const getSetupMessage = async () => {
    if (isInitiatingDevice) {
      const setupMessage = makeSetupMessage({
        keyShare,
        chainPath,
        message,
        devices: [...peers, localPartyId],
        signatureAlgorithm,
      })
      const encryptedSetupMessage = toMpcServerMessage(
        setupMessage,
        hexEncryptionKey
      )
      await uploadMpcSetupMessage({
        serverUrl,
        sessionId,
        message: encryptedSetupMessage,
        messageId,
      })

      return setupMessage
    }

    const encodedEncryptedSetupMsg = await waitForSetupMessage({
      serverUrl,
      sessionId,
      messageId,
    })
    return fromMpcServerMessage(encodedEncryptedSetupMsg, hexEncryptionKey)
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
    toMpcLibKeyshare({
      keyShare,
      signatureAlgorithm,
    })
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

    const messageToSend = toMpcServerMessage(body, hexEncryptionKey)

    await attempt(
      Promise.all(
        receivers.map((receiver, index) => {
          return sendMpcRelayMessage({
            serverUrl,
            sessionId,
            message: {
              session_id: sessionId,
              from: localPartyId,
              to: [receiver],
              body: messageToSend,
              hash: getMessageHash(base64Encode(body)),
              sequence_no: sequenceNo + index,
            },
            messageId,
          })
        })
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

    const relayMessages = await getMpcRelayMessages({
      serverUrl,
      localPartyId,
      sessionId,
      messageId,
    })

    for (const msg of relayMessages) {
      const decryptedMessage = fromMpcServerMessage(msg.body, hexEncryptionKey)
      if (session.inputMessage(decryptedMessage)) {
        return
      }
      await attempt(
        deleteMpcRelayMessage({
          serverUrl,
          localPartyId,
          sessionId,
          messageHash: msg.hash,
          messageId,
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
    messageId,
    jsonSignature: JSON.stringify(keysignSig),
  })
  return keysignSig
}
