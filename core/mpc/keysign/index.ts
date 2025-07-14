import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { encodeDERSignature } from '@core/mpc/derSignature'
import { getMessageHash } from '@core/mpc/getMessageHash'
import { KeysignSignature } from '@core/mpc/keysign/KeysignSignature'
import { markLocalPartyKeysignComplete } from '@core/mpc/keysignComplete'
import { sleep } from '@core/mpc/sleep'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { attempt } from '@lib/utils/attempt'
import { base64Encode } from '@lib/utils/base64Encode'
import { prefixErrorWith } from '@lib/utils/error/prefixErrorWith'
import { transformError } from '@lib/utils/error/transformError'
import { match } from '@lib/utils/match'
import { chainPromises } from '@lib/utils/promise/chainPromises'
import { ignorePromiseOutcome } from '@lib/utils/promise/ignorePromiseOutcome'
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields'
import { Minutes } from '@lib/utils/time'
import { convertDuration } from '@lib/utils/time/convertDuration'

import { initializeMpcLib } from '../lib/initialize'
import { makeSignSession, SignSession } from '../lib/signSession'
import { deleteMpcRelayMessage } from '../message/relay/delete'
import { getMpcRelayMessages } from '../message/relay/get'
import { sendMpcRelayMessage } from '../message/relay/send'
import { fromMpcServerMessage, toMpcServerMessage } from '../message/server'
import { ensureSetupMessage } from '../message/setup/ensure'

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
  await initializeMpcLib(signatureAlgorithm)

  const messageId = getMessageHash(message)

  const setupMessage = await ensureSetupMessage({
    keyShare,
    signatureAlgorithm,
    message,
    chainPath,
    devices: [localPartyId, ...peers],
    serverUrl,
    sessionId,
    hexEncryptionKey,
    isInitiatingDevice,
  })

  const session = makeSignSession({
    setupMessage,
    localPartyId,
    keyShare,
    signatureAlgorithm,
  })

  const setupMessageHash = shouldBePresent(
    SignSession[signatureAlgorithm].setupMessageHash(setupMessage),
    'Setup message hash'
  )

  if (message != Buffer.from(setupMessageHash).toString('hex')) {
    throw new Error('Setup message hash does not match the original message')
  }

  const abortController = new AbortController()

  const processOutbound = async (sequenceNo = 0): Promise<void> => {
    if (abortController.signal.aborted) {
      return
    }

    const message = session.outputMessage()
    if (!message) {
      await sleep(100)
      return processOutbound(sequenceNo)
    }

    const { body, receivers } = message

    const messageToSend = toMpcServerMessage(body, hexEncryptionKey)

    await chainPromises(
      receivers.map(
        (receiver, index) => () =>
          transformError(
            sendMpcRelayMessage({
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
            }),
            prefixErrorWith('Failed to send MPC relay message')
          )
      )
    )

    return processOutbound(sequenceNo + receivers.length)
  }

  const processInbound = async (): Promise<void> => {
    if (abortController.signal.aborted) {
      throw new Error(
        `Exited inbound processing due to a timeout after ${maxInboundWaitTime} min`
      )
    }

    const relayMessages = await transformError(
      getMpcRelayMessages({
        serverUrl,
        localPartyId,
        sessionId,
        messageId,
      }),
      prefixErrorWith('Failed to get MPC relay messages')
    )

    for (const msg of relayMessages) {
      if (
        session.inputMessage(fromMpcServerMessage(msg.body, hexEncryptionKey))
      ) {
        return
      }
      await ignorePromiseOutcome(
        transformError(
          deleteMpcRelayMessage({
            serverUrl,
            localPartyId,
            sessionId,
            messageHash: msg.hash,
            messageId,
          }),
          prefixErrorWith('Failed to delete MPC relay message')
        )
      )
    }

    return processInbound()
  }

  const outboundPromise = processOutbound()

  const timeout = setTimeout(
    () => {
      abortController.abort()
    },
    convertDuration(maxInboundWaitTime, 'min', 'ms')
  )
  const { error } = await attempt(processInbound())
  abortController.abort()

  await attempt(outboundPromise)
  clearTimeout(timeout)

  if (error) {
    throw error
  }

  const signature = session.finish()
  const [rawR, rawS] = [signature.slice(0, 32), signature.slice(32, 64)]
  const [r, s] = [rawR, rawS]
    .map(value => Buffer.from(value))
    .map(value =>
      match(signatureAlgorithm, {
        ecdsa: () => value,
        eddsa: () => value.reverse(),
      })
    )
    .map(value => value.toString('hex'))

  const derSignature = encodeDERSignature(rawR, rawS)
  const result: KeysignSignature = withoutUndefinedFields({
    msg: Buffer.from(message, 'hex').toString('base64'),
    r,
    s,
    recovery_id: match(signatureAlgorithm, {
      ecdsa: () => signature[64].toString(16).padStart(2, '0'),
      eddsa: () => undefined,
    }),
    der_signature: Buffer.from(derSignature).toString('hex'),
  })

  ignorePromiseOutcome(
    transformError(
      markLocalPartyKeysignComplete({
        serverUrl,
        sessionId,
        messageId,
        result,
      }),
      prefixErrorWith('Failed to mark local party keysign complete')
    )
  )

  return result
}
