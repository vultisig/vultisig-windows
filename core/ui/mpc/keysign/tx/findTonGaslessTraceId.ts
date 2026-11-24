import { rootApiUrl } from '@vultisig/core-config'
import { attempt } from '@vultisig/lib-utils/attempt'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'
import { sleep } from '@vultisig/lib-utils/sleep'

type TonTransactionsByMessageResponse = {
  transactions?: { trace_id?: string | null }[]
}

const maxAttempts = 5
const retryDelayMs = 1000

/**
 * Finds the trace of the relayed (gasless) TON transaction whose signed
 * request body has this hash, as hex. The trace id is the hash of the relay's
 * external message: the one the relay reports to whichever device reaches it
 * first, and the one explorers resolve. Polls briefly, since the indexer can
 * lag the relay; resolves to undefined when nothing is indexed in that window.
 *
 * Stand-in until vultisig/vultisig-sdk#2650 returns the resolved hash from
 * the SDK's status lookup.
 */
export const findTonGaslessTraceId = async (
  bodyHash: string
): Promise<string | undefined> => {
  const params = new URLSearchParams({
    body_hash: bodyHash,
    direction: 'in',
    limit: '1',
  })
  const url = `${rootApiUrl}/ton/v3/transactionsByMessage?${params}`

  for (let index = 0; index < maxAttempts; index++) {
    if (index > 0) {
      await sleep(retryDelayMs)
    }

    const result = await attempt(() =>
      queryUrl<TonTransactionsByMessageResponse>(url)
    )

    const traceId =
      'data' in result ? result.data?.transactions?.[0]?.trace_id : undefined

    if (traceId) {
      return Buffer.from(traceId, 'base64').toString('hex')
    }
  }

  return undefined
}
