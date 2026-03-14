const moneroDaemonUrls = [
  'https://xmr-node.cakewallet.com:18081',
  'https://node.sethforprivacy.com',
  'https://xmr.ci.vet:443',
]

export type MoneroDaemonTxMetadata = {
  hash: string
  height: number | null
  extra: Uint8Array | null
  outputs: Array<{
    stealthPublicKeyHex: string
    globalIndex?: number
  }>
  rctSignatures?: {
    type?: number
    ecdhInfo?: Array<{
      mask?: string
      amount?: string
    }>
  }
}

export const getMoneroDaemonUrls = (): string[] => [...moneroDaemonUrls]

export const getMoneroDaemonUrl = (): string => moneroDaemonUrls[0]

const rpcTimeoutMs = 30_000
const moneroBlockTimeSeconds = 120
const blocksPerYear = Math.floor((365 * 24 * 60 * 60) / moneroBlockTimeSeconds)

const postJsonRpc = async (
  daemonUrl: string,
  method: string,
  params?: Record<string, unknown>
) => {
  const url = `${daemonUrl.replace(/\/$/, '')}/json_rpc`
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: '0', method, params }),
    signal: AbortSignal.timeout(rpcTimeoutMs),
  })
  const json = await resp.json()
  if (json.error) {
    throw new Error(`Monero RPC ${method}: ${json.error.message}`)
  }
  return json.result
}

const postBinRpc = async (
  daemonUrl: string,
  endpoint: string,
  body: Record<string, unknown>
) => {
  const url = `${daemonUrl.replace(/\/$/, '')}/${endpoint}`
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(rpcTimeoutMs),
  })
  const json = await resp.json()
  if (json.status && json.status !== 'OK') {
    throw new Error(`Monero RPC ${endpoint}: ${json.status}`)
  }
  return json
}

const postPathRequest = async (
  daemonUrl: string,
  endpoint: string,
  body: Record<string, unknown>
) => {
  const url = `${daemonUrl.replace(/\/$/, '')}/${endpoint}`
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(rpcTimeoutMs),
  })
  return resp.json()
}

const jsonRpc = async (method: string, params?: Record<string, unknown>) => {
  let lastError: unknown = null

  for (const daemonUrl of getMoneroDaemonUrls()) {
    try {
      return await postJsonRpc(daemonUrl, method, params)
    } catch (error) {
      console.warn(`[monero-rpc] ${method} failed on ${daemonUrl}:`, error)
      lastError = error
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Monero RPC ${method} failed`)
}

const binRpc = async (endpoint: string, body: Record<string, unknown>) => {
  let lastError: unknown = null

  for (const daemonUrl of getMoneroDaemonUrls()) {
    try {
      return await postBinRpc(daemonUrl, endpoint, body)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Monero RPC ${endpoint} failed`)
}

type OutputDistributionEntry = {
  distribution: number[]
  start_height: number
  base: number
}

const getOutputDistributionWithUrl = async (
  daemonUrl: string,
  fromHeight: number,
  toHeight: number
): Promise<OutputDistributionEntry> => {
  const safeToHeight = Math.max(0, toHeight - 1)
  const result = await postJsonRpc(daemonUrl, 'get_output_distribution', {
    amounts: [0],
    cumulative: true,
    binary: false,
    from_height: fromHeight,
    to_height: safeToHeight,
  })
  return result.distributions[0]
}

export const getOutputDistribution = async (
  fromHeight: number,
  toHeight: number
): Promise<OutputDistributionEntry> => {
  const fallbackWindows =
    fromHeight === 0
      ? [blocksPerYear, blocksPerYear * 2, blocksPerYear * 4]
      : []
  let lastError: unknown = null

  for (const daemonUrl of getMoneroDaemonUrls()) {
    try {
      return await getOutputDistributionWithUrl(daemonUrl, fromHeight, toHeight)
    } catch (error) {
      lastError = error
      console.warn('[monero-rpc][get_output_distribution][failed]', {
        daemonUrl,
        fromHeight,
        toHeight,
        error: error instanceof Error ? error.message : String(error),
      })
    }

    for (const windowSize of fallbackWindows) {
      const fallbackFromHeight = Math.max(0, toHeight - windowSize)
      if (fallbackFromHeight <= fromHeight) {
        continue
      }

      try {
        return await getOutputDistributionWithUrl(
          daemonUrl,
          fallbackFromHeight,
          toHeight
        )
      } catch (error) {
        lastError = error
        console.warn('[monero-rpc][get_output_distribution][fallback-failed]', {
          daemonUrl,
          fromHeight: fallbackFromHeight,
          toHeight,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Monero RPC get_output_distribution failed')
}

type OutputEntry = {
  key: string
  mask: string
  txid: string
  unlocked: boolean
  height: number
}

export const getOuts = async (indices: number[]): Promise<OutputEntry[]> => {
  if (indices.length === 0) return []

  const result = await binRpc('get_outs', {
    outputs: indices.map(index => ({ amount: 0, index })),
    get_txid: true,
  })

  if (!Array.isArray(result?.outs)) {
    console.error('[monero-rpc][get_outs] unexpected response:', result)
    throw new Error(
      `Monero get_outs failed: ${result?.status || 'missing outs in response'}`
    )
  }

  return result.outs
}

type FeeEstimate = {
  fee: number
  quantization_mask: number
}

export const getFeeEstimate = async (): Promise<FeeEstimate> => {
  const result = await jsonRpc('get_fee_estimate')
  return { fee: result.fee, quantization_mask: result.quantization_mask }
}

export const submitRawTx = async (txHex: string): Promise<void> => {
  const result = await binRpc('sendrawtransaction', {
    tx_as_hex: txHex,
    do_not_relay: false,
  })
  if (result.status !== 'OK') {
    console.error('[monero-rpc][sendrawtransaction] rejected:', result)
    throw new Error(
      `Monero broadcast rejected: ${result.reason || result.status}`
    )
  }
}

export const getChainHeight = async (): Promise<number> => {
  const result = await jsonRpc('get_info')
  return result.height
}

const getKeyImageSpentWithUrl = async (
  daemonUrl: string,
  keyImages: string[]
): Promise<boolean[]> => {
  const url = `${daemonUrl.replace(/\/$/, '')}/is_key_image_spent`
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key_images: keyImages }),
    signal: AbortSignal.timeout(rpcTimeoutMs),
  })
  if (!resp.ok) {
    throw new Error(`Monero RPC is_key_image_spent: ${resp.status}`)
  }

  const data = (await resp.json()) as { spent_status?: number[] }
  if (!Array.isArray(data.spent_status)) {
    throw new Error('Monero RPC is_key_image_spent: missing spent_status')
  }

  return data.spent_status.map(status => status !== 0)
}

export const isKeyImageSpent = async (
  keyImages: string[],
  daemonUrl?: string
): Promise<boolean[]> => {
  if (keyImages.length === 0) {
    return []
  }

  const daemonUrls = daemonUrl ? [daemonUrl] : getMoneroDaemonUrls()
  let lastError: unknown = null

  for (const url of daemonUrls) {
    try {
      return await getKeyImageSpentWithUrl(url, keyImages)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Monero key image spent check failed')
}

export const getTransactionsByHashes = async (
  txHashes: string[],
  daemonUrl?: string
): Promise<MoneroDaemonTxMetadata[]> => {
  if (txHashes.length === 0) {
    return []
  }

  const daemonUrls = daemonUrl ? [daemonUrl] : getMoneroDaemonUrls()
  let lastError: unknown = null

  for (const url of daemonUrls) {
    try {
      const data = await postPathRequest(url, 'get_transactions', {
        txs_hashes: txHashes,
        decode_as_json: true,
      })

      const txs = Array.isArray(data?.txs) ? data.txs : []
      return txs.flatMap((tx: any, index: number) => {
        const txHash = txHashes[index]?.toLowerCase()
        if (!txHash || !tx?.as_json) {
          return []
        }

        const txJson = JSON.parse(tx.as_json)
        const outputIndices = Array.isArray(tx.output_indices)
          ? tx.output_indices
          : []
        const outputs = Array.isArray(txJson?.vout)
          ? txJson.vout.flatMap((output: any, outputIndex: number) => {
              const stealthPublicKeyHex =
                output?.target?.tagged_key?.key ?? output?.target?.key
              if (typeof stealthPublicKeyHex !== 'string') {
                return []
              }

              return [
                {
                  stealthPublicKeyHex: stealthPublicKeyHex.toLowerCase(),
                  globalIndex:
                    typeof outputIndices[outputIndex] === 'number'
                      ? outputIndices[outputIndex]
                      : undefined,
                },
              ]
            })
          : []

        return [
          {
            hash: txHash,
            height:
              typeof tx.block_height === 'number' ? tx.block_height : null,
            extra: Array.isArray(txJson?.extra)
              ? Uint8Array.from(txJson.extra)
              : null,
            outputs,
            rctSignatures:
              typeof txJson?.rct_signatures === 'object'
                ? txJson.rct_signatures
                : undefined,
          },
        ]
      })
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Monero transaction metadata fetch failed')
}
