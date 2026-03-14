import { base64Encode } from '@lib/utils/base64Encode'

import {
  fromt_encode_map,
  fromt_handle_free,
  fromt_spend_complete,
  fromt_spend_preprocess,
  fromt_spend_sign,
  fromt_tx_hash,
} from '../../../lib/fromt/fromt_wasm'
import { getMessageHash } from '../getMessageHash'
import { MpcRelayMessage } from '../message/relay'
import { deleteMpcRelayMessage } from '../message/relay/delete'
import { getMpcRelayMessages } from '../message/relay/get'
import { sendMpcRelayMessage } from '../message/relay/send'
import { fromMpcServerMessage, toMpcServerMessage } from '../message/server'
import { sleep } from '../sleep'
import { initializeFromt } from './initialize'

type SpendCeremonyParams = {
  keyShare: Uint8Array
  signableTx: Uint8Array
  signers: string[]
  localPartyId: string
  serverUrl: string
  sessionId: string
  hexEncryptionKey: string
  isInitiatingDevice: boolean
}

const spendLog = (tag: string, ...args: unknown[]) =>
  console.log(`[fromt-spend][${tag}]`, ...args)

function getSortedParties(signers: string[]): string[] {
  return [...signers].sort()
}

function getFrostId(partyId: string, signers: string[]): number {
  const sorted = getSortedParties(signers)
  return sorted.indexOf(partyId) + 1
}

async function exchangeRound({
  serverUrl,
  sessionId,
  localPartyId,
  signers,
  hexEncryptionKey,
  messageId,
  localData,
}: {
  serverUrl: string
  sessionId: string
  localPartyId: string
  signers: string[]
  hexEncryptionKey: string
  messageId: string
  localData: Uint8Array
}): Promise<Map<number, Uint8Array>> {
  const sorted = getSortedParties(signers)
  const localFrostId = getFrostId(localPartyId, signers)

  const encrypted = toMpcServerMessage(localData, hexEncryptionKey)

  for (const receiver of sorted) {
    if (receiver === localPartyId) continue
    const msg: MpcRelayMessage = {
      session_id: sessionId,
      from: localPartyId,
      to: [receiver],
      body: encrypted,
      hash: getMessageHash(base64Encode(localData)),
      sequence_no: 0,
    }
    await sendMpcRelayMessage({
      serverUrl,
      sessionId,
      message: msg,
      messageId,
    })
  }

  const collected = new Map<number, Uint8Array>()
  collected.set(localFrostId, localData)

  const seen = new Set<string>()
  const start = Date.now()
  const timeoutMs = 60000

  while (collected.size < sorted.length) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(`fromt spend: ${messageId} timeout after ${timeoutMs}ms`)
    }

    const messages = await getMpcRelayMessages({
      serverUrl,
      localPartyId,
      sessionId,
      messageId,
    })

    for (const msg of messages) {
      const cacheKey = `${msg.session_id}-${msg.from}-${msg.hash}`
      if (seen.has(cacheKey)) continue
      seen.add(cacheKey)

      const decrypted = fromMpcServerMessage(msg.body, hexEncryptionKey)
      const senderId = getFrostId(msg.from, signers)
      collected.set(senderId, decrypted)

      await deleteMpcRelayMessage({
        serverUrl,
        localPartyId,
        sessionId,
        messageHash: msg.hash,
        messageId,
      })
    }

    if (collected.size < sorted.length) {
      await sleep(100)
    }
  }

  return collected
}

function buildEncodeMap(collected: Map<number, Uint8Array>): Uint8Array {
  const entries = Array.from(collected.entries()).map(([id, data]) => ({
    id,
    value: data,
  }))
  return fromt_encode_map(entries)
}

export type SpendCeremonyResult = {
  rawTx: Uint8Array
  txHash: string
}

export async function runFromtSpendCeremony(
  params: SpendCeremonyParams
): Promise<SpendCeremonyResult> {
  await initializeFromt()

  const {
    keyShare,
    signableTx,
    signers,
    localPartyId,
    serverUrl,
    sessionId,
    hexEncryptionKey,
  } = params

  spendLog('start', { localPartyId, signers })

  let preprocessHandleId: number | null = null
  let signHandleId: number | null = null

  try {
    spendLog('phase1', 'preprocessing...')
    const preprocessResult = fromt_spend_preprocess(keyShare, signableTx)
    preprocessHandleId = preprocessResult.handle_id
    const localPreprocess = preprocessResult.preprocess

    spendLog(
      'phase1',
      `preprocess done, handle=${preprocessHandleId}, size=${localPreprocess.length}`
    )

    const preprocesses = await exchangeRound({
      serverUrl,
      sessionId,
      localPartyId,
      signers,
      hexEncryptionKey,
      messageId: 'monero-spend-preprocess',
      localData: new Uint8Array(localPreprocess),
    })

    spendLog('phase2', 'signing...')
    const preprocessMap = buildEncodeMap(preprocesses)
    const signResult = fromt_spend_sign(preprocessHandleId, preprocessMap)
    preprocessHandleId = null
    signHandleId = signResult.handle_id
    const localShare = signResult.share

    spendLog(
      'phase2',
      `sign done, handle=${signHandleId}, size=${localShare.length}`
    )

    const shares = await exchangeRound({
      serverUrl,
      sessionId,
      localPartyId,
      signers,
      hexEncryptionKey,
      messageId: 'monero-spend-share',
      localData: new Uint8Array(localShare),
    })

    spendLog('phase3', 'completing...')
    const localFrostId = getFrostId(localPartyId, signers)
    shares.delete(localFrostId)
    const sharesMap = buildEncodeMap(shares)
    const rawTx = fromt_spend_complete(signHandleId, sharesMap)
    signHandleId = null

    const hashBytes = fromt_tx_hash(rawTx)
    const txHash = Buffer.from(hashBytes).toString('hex')

    spendLog('phase3', `complete, tx size=${rawTx.length}, hash=${txHash}`)
    return { rawTx, txHash }
  } catch (error) {
    spendLog('error', error)
    if (preprocessHandleId !== null) {
      try {
        fromt_handle_free(preprocessHandleId)
      } catch {
        /* ignore */
      }
    }
    if (signHandleId !== null) {
      try {
        fromt_handle_free(signHandleId)
      } catch {
        /* ignore */
      }
    }
    throw error
  }
}
