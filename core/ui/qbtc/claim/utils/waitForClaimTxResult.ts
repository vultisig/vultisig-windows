import { qbtcRestUrl } from '@vultisig/core-chain/chains/cosmos/qbtc/tendermintRpcUrl'
import { sleep } from '@vultisig/lib-utils/sleep'

type ClaimTxResult = {
  totalAmountClaimed: bigint
  utxosClaimed: number
  utxosSkipped: number
  txHash: string
}

type WaitForClaimTxResultInput = {
  txHash: string
  timeoutMs?: number
  intervalMs?: number
}

type TxEventAttribute = {
  key?: string
  value?: string
}

type TxEvent = {
  type?: string
  attributes?: TxEventAttribute[]
}

type TxResponse = {
  code?: number
  raw_log?: string
  log?: string
  events?: TxEvent[]
}

type TxQueryResponse = {
  tx_response?: TxResponse
}

const claimWithProofEventType = 'claim_with_proof'

const findEventAttr = ({
  events,
  type,
  key,
}: {
  events?: TxEvent[]
  type: string
  key: string
}): string | undefined =>
  events
    ?.find(event => event.type === type)
    ?.attributes?.find(attribute => attribute.key === key)?.value

const readClaimEventAttr = ({
  events,
  txHash,
  key,
}: {
  events?: TxEvent[]
  txHash: string
  key: string
}): string => {
  const value = findEventAttr({ events, type: claimWithProofEventType, key })

  if (value === undefined || value.length === 0) {
    throw new Error(`QBTC claim tx ${txHash}: missing ${key}`)
  }

  return value
}

const readClaimEventCount = ({
  events,
  txHash,
  key,
}: {
  events?: TxEvent[]
  txHash: string
  key: string
}): number => {
  const value = readClaimEventAttr({ events, txHash, key })
  const result = Number(value)

  if (!Number.isSafeInteger(result) || result < 0) {
    throw new Error(`QBTC claim tx ${txHash}: invalid ${key} ${value}`)
  }

  return result
}

const readClaimEventAmount = ({
  events,
  txHash,
  key,
}: {
  events?: TxEvent[]
  txHash: string
  key: string
}): bigint => {
  const value = readClaimEventAttr({ events, txHash, key })

  try {
    const result = BigInt(value)

    if (result < 0n) {
      throw new Error()
    }

    return result
  } catch {
    throw new Error(`QBTC claim tx ${txHash}: invalid ${key} ${value}`)
  }
}

const parseClaimResultFromEvents = ({
  events,
  txHash,
}: {
  events?: TxEvent[]
  txHash: string
}): ClaimTxResult => ({
  totalAmountClaimed: readClaimEventAmount({
    events,
    txHash,
    key: 'total_amount',
  }),
  utxosClaimed: readClaimEventCount({
    events,
    txHash,
    key: 'utxos_claimed',
  }),
  utxosSkipped: readClaimEventCount({
    events,
    txHash,
    key: 'utxos_skipped',
  }),
  txHash,
})

/**
 * Polls the QBTC REST API until a proof-service-broadcast claim transaction is included.
 *
 * @param input Transaction hash plus optional total timeout and polling interval.
 * @returns Parsed claim totals from the included transaction events.
 */
export const waitForClaimTxResult = async ({
  txHash,
  timeoutMs = 30_000,
  intervalMs = 1_000,
}: WaitForClaimTxResultInput): Promise<ClaimTxResult> => {
  const url = `${qbtcRestUrl}/cosmos/tx/v1beta1/txs/${txHash}`
  const deadline = Date.now() + timeoutMs

  while (Date.now() <= deadline) {
    const controller = new AbortController()
    const timer = setTimeout(
      () => controller.abort(),
      Math.min(intervalMs, 10_000)
    )
    let response: Response

    try {
      response = await fetch(url, { signal: controller.signal })
    } finally {
      clearTimeout(timer)
    }

    if (response.ok) {
      const data: TxQueryResponse = await response.json()
      const txResponse = data.tx_response

      if (!txResponse) {
        throw new Error(`QBTC claim tx ${txHash}: missing tx_response`)
      }

      if (txResponse.code !== 0) {
        throw new Error(
          `QBTC claim tx error: ${txResponse.raw_log || txResponse.log}`
        )
      }

      return parseClaimResultFromEvents({
        events: txResponse.events,
        txHash,
      })
    }

    if (response.status !== 404) {
      const text = await response.text()
      throw new Error(
        `QBTC claim inclusion query failed (${response.status}): ${text}`
      )
    }

    await sleep(intervalMs)
  }

  throw new Error(`QBTC claim tx ${txHash} not included within ${timeoutMs}ms`)
}
