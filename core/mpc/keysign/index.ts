import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { encodeDERSignature } from '@core/mpc/derSignature'
import { getMessageHash } from '@core/mpc/getMessageHash'
import { KeysignSignature } from '@core/mpc/keysign/KeysignSignature'
import { markLocalPartyKeysignComplete } from '@core/mpc/keysignComplete'
import { sleep } from '@core/mpc/sleep'
import { attempt } from '@lib/utils/attempt'
import { base64Encode } from '@lib/utils/base64Encode'
import { prefixErrorWith } from '@lib/utils/error/prefixErrorWith'
import { transformError } from '@lib/utils/error/transformError'
import { chainPromises } from '@lib/utils/promise/chainPromises'
import { Minutes } from '@lib/utils/time'
import { convertDuration } from '@lib/utils/time/convertDuration'

import { makeSignSession } from '../lib/signSession'
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

  console.log('setupMessage', setupMessage)

  const session = makeSignSession({
    setupMessage,
    localPartyId,
    keyShare,
    signatureAlgorithm,
  })

  console.log('session', session)

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
      await transformError(
        deleteMpcRelayMessage({
          serverUrl,
          localPartyId,
          sessionId,
          messageHash: msg.hash,
          messageId,
        }),
        prefixErrorWith('Failed to delete MPC relay message')
      )
    }
  }

  const outboundPromise = processOutbound()

  const timeout = setTimeout(
    () => abortController.abort(),
    convertDuration(maxInboundWaitTime, 'min', 's')
  )
  const inboundResult = await attempt(processInbound())

  await attempt(outboundPromise)
  clearTimeout(timeout)

  if ('error' in inboundResult) {
    throw inboundResult.error
  }

  const signature = session.finish()
  const r = signature.slice(0, 32)
  const s = signature.slice(32, 64)
  const recoveryId = signature[64]
  const derSignature = encodeDERSignature(r, s)
  const result: KeysignSignature = {
    msg: Buffer.from(message, 'hex').toString('base64'),
    r: Buffer.from(r).toString('hex'),
    s: Buffer.from(s).toString('hex'),
    recovery_id: recoveryId.toString(16).padStart(2, '0'),
    der_signature: Buffer.from(derSignature).toString('hex'),
  }

  await transformError(
    markLocalPartyKeysignComplete({
      serverUrl,
      sessionId,
      messageId,
      result,
    }),
    prefixErrorWith('Failed to mark local party keysign complete')
  )

  return result
}
