import { base64Encode } from '@lib/utils/base64Encode'

import {
  frozt_keyshare_bundle_birthday,
  frozt_keyshare_bundle_pub_key_package,
  frozt_keyshare_bundle_sapling_extras,
  FroztDkgSession,
  FroztKeyImportSession,
  FroztReshareSession,
  FroztSignSession,
} from '../../../lib/frozt/frozt_wasm'
import { getMessageHash } from '../getMessageHash'
import { MpcRelayMessage } from '../message/relay'
import { deleteMpcRelayMessage } from '../message/relay/delete'
import { getMpcRelayMessages } from '../message/relay/get'
import { sendMpcRelayMessage } from '../message/relay/send'
import { fromMpcServerMessage, toMpcServerMessage } from '../message/server'
import { sleep } from '../sleep'
import { FroztKeygenResult } from './frozt'
import { initializeFrozt } from './initialize'

export type FroztSessionHandle =
  | FroztDkgSession
  | FroztKeyImportSession
  | FroztReshareSession
  | FroztSignSession

type FrostSessionLike = {
  takeMsg(): Uint8Array | undefined
  msgReceiver(msg: Uint8Array, index: number): string | undefined
  feed(msg: Uint8Array): boolean
  result(): any
  free(): void
}

type RunFroztSessionParams = {
  session: FroztSessionHandle | FrostSessionLike
  messageId: string
  serverUrl: string
  sessionId: string
  localPartyId: string
  signers: string[]
  hexEncryptionKey: string
  timeoutMs?: number
}

function getSortedParties(signers: string[]): string[] {
  return [...signers].sort()
}

function getFrostId(partyId: string, signers: string[]): number {
  const sorted = getSortedParties(signers)
  const idx = sorted.indexOf(partyId)
  return idx + 1
}

const froztLog = (tag: string, ...args: unknown[]) =>
  console.log(`[frozt-session][${tag}]`, ...args)

async function drainAndSendOutbound({
  session,
  messageId,
  serverUrl,
  sessionId,
  localPartyId,
  signers,
  hexEncryptionKey,
}: RunFroztSessionParams): Promise<number> {
  const sorted = getSortedParties(signers)
  let sequenceNo = 0
  let msgCount = 0

  while (true) {
    const msg = session.takeMsg()
    if (!msg) break

    const payload = msg.slice(2)
    const encrypted = toMpcServerMessage(payload, hexEncryptionKey)

    for (let i = 0; i < sorted.length; i++) {
      const receiver = session.msgReceiver(msg, i)
      if (!receiver) continue

      const relayMessage: MpcRelayMessage = {
        session_id: sessionId,
        from: localPartyId,
        to: [receiver],
        body: encrypted,
        hash: getMessageHash(base64Encode(payload)),
        sequence_no: sequenceNo++,
      }

      await sendMpcRelayMessage({
        serverUrl,
        sessionId,
        message: relayMessage,
        messageId,
      })
      msgCount++
    }
  }

  return msgCount
}

export async function runFroztSession(
  params: RunFroztSessionParams
): Promise<Uint8Array> {
  await initializeFrozt()

  const {
    session,
    messageId,
    serverUrl,
    sessionId,
    localPartyId,
    signers,
    hexEncryptionKey,
    timeoutMs = 60000,
  } = params

  const seen = new Set<string>()
  const start = Date.now()
  let finished = false

  froztLog('start', { messageId, localPartyId, signers, timeoutMs })

  let round = 0
  try {
    const initialSent = await drainAndSendOutbound(params)
    froztLog('outbound', `initial drain sent ${initialSent} messages`)

    while (!finished) {
      const elapsed = Date.now() - start
      if (elapsed > timeoutMs) {
        froztLog('timeout', `${timeoutMs}ms elapsed, ${round} rounds completed`)
        throw new Error(`frozt session timeout after ${timeoutMs}ms`)
      }

      const messages = await getMpcRelayMessages({
        serverUrl,
        localPartyId,
        sessionId,
        messageId,
      })

      if (messages.length === 0) {
        await sleep(100)
        continue
      }

      round++
      froztLog(
        'inbound',
        `round ${round}: ${messages.length} messages from relay`
      )

      for (const msg of messages) {
        const cacheKey = `${msg.session_id}-${msg.from}-${msg.hash}`
        if (seen.has(cacheKey)) continue
        seen.add(cacheKey)

        const decrypted = fromMpcServerMessage(msg.body, hexEncryptionKey)
        const senderFrostId = getFrostId(msg.from, signers)
        const frame = new Uint8Array(2 + decrypted.length)
        const view = new DataView(frame.buffer)
        view.setUint16(0, senderFrostId, true)
        frame.set(decrypted, 2)

        froztLog(
          'feed',
          `from=${msg.from} frostId=${senderFrostId} payloadSize=${decrypted.length}`
        )
        finished = session.feed(frame)
        froztLog('feed', `finished=${finished}`)

        await deleteMpcRelayMessage({
          serverUrl,
          localPartyId,
          sessionId,
          messageHash: msg.hash,
          messageId,
        })

        if (finished) break
      }

      if (!finished) {
        const sent = await drainAndSendOutbound(params)
        if (sent > 0) {
          froztLog('outbound', `round ${round}: sent ${sent} messages`)
        }
        await sleep(100)
      }
    }

    const finalSent = await drainAndSendOutbound(params)
    if (finalSent > 0) {
      froztLog('outbound', `final drain sent ${finalSent} messages`)
    }

    froztLog(
      'done',
      `completed in ${Date.now() - start}ms after ${round} rounds`
    )
    return session.result()
  } catch (error) {
    froztLog('error', error)
    throw error
  } finally {
    session.free()
  }
}

export function parseFroztBundleResult(bundle: Uint8Array): FroztKeygenResult {
  const pubKeyPackage = frozt_keyshare_bundle_pub_key_package(bundle)
  const saplingExtras = frozt_keyshare_bundle_sapling_extras(bundle)
  const birthday = Number(frozt_keyshare_bundle_birthday(bundle))

  return {
    bundle: base64Encode(bundle),
    pubKeyPackage: base64Encode(pubKeyPackage),
    saplingExtras: base64Encode(saplingExtras),
    birthday,
  }
}
