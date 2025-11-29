import { OtherChain } from '@core/chain/Chain'
import { getCardanoTxHash } from '@core/chain/tx/hash/resolvers/cardano'
import { rootApiUrl } from '@core/config'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { isInError } from '@lib/utils/error/isInError'

import { BroadcastTxResolver } from '../resolver'
import { selectEncodedBytes } from './utxo'

const cardanoBroadcastUrl = `${rootApiUrl}/ada/`

type OgmiosResponse =
  | {
      jsonrpc?: string
      result?: { transaction?: { id?: string } }
      error?: { code?: number; message?: string }
    }
  | string

const normalizeHash = (hash: string): string => hash.replace(/^0x/i, '')

const parseJson = (raw: string): OgmiosResponse | null => {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const extractTxHash = (response: OgmiosResponse | null): string | null => {
  if (!response) {
    return null
  }

  if (typeof response === 'string') {
    const trimmed = response.trim()
    return trimmed ? normalizeHash(trimmed) : null
  }

  const txId = response.result?.transaction?.id

  if (typeof txId === 'string' && txId.trim()) {
    return normalizeHash(txId.trim())
  }

  return null
}

const extractError = (response: OgmiosResponse | null, raw: string): string => {
  if (!response) {
    return extractErrorMsg(raw)
  }

  if (typeof response === 'string') {
    return extractErrorMsg(response)
  }

  return extractErrorMsg(response.error ?? raw)
}

export const broadcastCardanoTx: BroadcastTxResolver<
  OtherChain.Cardano
> = async ({ chain, tx }) => {
  const encodedBytes = selectEncodedBytes(chain, tx)
  const cborHex = Buffer.from(encodedBytes).toString('hex')

  // @tony: sticking with the direct fetch here. Our 'queryUrl' auto-runs assertFetchResponse, which throws before we can inspect the raw body or status.
  const response = await fetch(cardanoBroadcastUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'submitTransaction',
      params: {
        transaction: {
          cbor: cborHex,
        },
      },
      id: 1,
    }),
  })

  const responseText = await response.text()
  const parsed = parseJson(responseText)

  const rpcErrorCode =
    parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed.error?.code
      : undefined

  if (rpcErrorCode === 3117) {
    return normalizeHash(await getCardanoTxHash(tx))
  }

  const txHash = extractTxHash(parsed) ?? extractTxHash(responseText)

  if (txHash) {
    return txHash
  }

  const error = extractError(parsed, responseText)

  if (
    isInError(
      error,
      'BadInputsUTxO',
      'timed out',
      'txn-mempool-conflict',
      'already known'
    )
  ) {
    return null
  }

  throw new Error(`Failed to broadcast transaction: ${error}`)
}
