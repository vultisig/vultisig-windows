import { base64Encode } from '@lib/utils/base64Encode'

import {
  frozt_keyshare_bundle_birthday,
  frozt_keyshare_bundle_pack,
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
import { initializeFrozt } from './initialize'

export type FroztKeygenResult = {
  bundle: string
  pubKeyPackage: string
  saplingExtras: string
  birthday: number
}

export type FroztReshareResult = {
  keyPackage: Uint8Array
  pubKeyPackage: Uint8Array
}

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
  preserveSignerOrder?: boolean
  timeoutMs?: number
}

function getPartyOrder(
  signers: string[],
  preserveSignerOrder = false
): string[] {
  return preserveSignerOrder ? [...signers] : [...signers].sort()
}

function getFrostId(
  partyId: string,
  signers: string[],
  preserveSignerOrder = false
): number {
  const ordered = getPartyOrder(signers, preserveSignerOrder)
  const idx = ordered.indexOf(partyId)
  if (idx === -1) {
    throw new Error(`Unknown FROZT signer ${partyId}`)
  }
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
  preserveSignerOrder = false,
}: RunFroztSessionParams): Promise<number> {
  const orderedSigners = getPartyOrder(signers, preserveSignerOrder)
  let sequenceNo = 0
  let msgCount = 0

  while (true) {
    const msg = session.takeMsg()
    if (!msg) break

    const payload = msg.slice(2)
    const encrypted = toMpcServerMessage(payload, hexEncryptionKey)

    for (let i = 0; i < orderedSigners.length; i++) {
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
    preserveSignerOrder = false,
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
        const senderFrostId = getFrostId(msg.from, signers, preserveSignerOrder)
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

export function packFroztReshareBundle(
  result: FroztReshareResult,
  oldBundle: Uint8Array
): Uint8Array {
  const saplingExtras = frozt_keyshare_bundle_sapling_extras(oldBundle)
  const birthday = frozt_keyshare_bundle_birthday(oldBundle)

  return frozt_keyshare_bundle_pack(
    result.keyPackage,
    result.pubKeyPackage,
    saplingExtras,
    birthday
  )
}
