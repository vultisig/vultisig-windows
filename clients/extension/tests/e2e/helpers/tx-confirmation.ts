/**
 * Transaction Confirmation Helpers
 *
 * Polls for on-chain transaction confirmation across different chain families.
 * Supports: EVM, UTXO (Bitcoin), Cosmos, Solana
 */

/**
 * TX confirmation result
 */
export type TxConfirmationResult = {
  confirmed: boolean
  blockNumber: number | null
  gasUsed: bigint | null
  error?: string
}

/** Default confirmation cap: keysign plus inclusion regularly exceeds two minutes on mainnet. */
export const defaultConfirmationTimeoutMs = 300_000

/**
 * Chain family type
 */
type ChainFamily = 'evm' | 'utxo' | 'cosmos' | 'solana'

/**
 * RPC endpoints for different chains
 */
const rpcEndpoints: Record<string, string> = {
  // EVM chains
  ethereum: 'https://ethereum-rpc.publicnode.com',
  bsc: 'https://bsc-dataseed.binance.org',
  polygon: 'https://polygon-rpc.com',
  arbitrum: 'https://arb1.arbitrum.io/rpc',
  optimism: 'https://mainnet.optimism.io',
  avalanche: 'https://api.avax.network/ext/bc/C/rpc',
  base: 'https://mainnet.base.org',

  // UTXO chains (via mempool.space or blockstream)
  bitcoin: 'https://mempool.space/api',
  litecoin: 'https://litecoinspace.org/api',
  dogecoin: 'https://dogechain.info/api/v1',

  // Cosmos chains
  cosmos: 'https://cosmos-rest.publicnode.com',
  thorchain: 'https://gateway.liquify.com/chain/thorchain_api',

  // Solana
  solana: 'https://api.mainnet-beta.solana.com',
}

/**
 * Determine chain family from chain name
 */
function getChainFamily(chain: string): ChainFamily {
  const evmChains = [
    'ethereum',
    'bsc',
    'polygon',
    'arbitrum',
    'optimism',
    'avalanche',
    'base',
  ]
  const utxoChains = ['bitcoin', 'litecoin', 'dogecoin', 'dash', 'zcash']
  const cosmosChains = ['cosmos', 'thorchain', 'osmosis', 'kava', 'terra']

  const chainLower = chain.toLowerCase()

  if (evmChains.includes(chainLower)) return 'evm'
  if (utxoChains.includes(chainLower)) return 'utxo'
  if (cosmosChains.includes(chainLower)) return 'cosmos'
  if (chainLower === 'solana') return 'solana'

  // Default to EVM
  return 'evm'
}

/**
 * Public EVM endpoints intermittently answer with an HTML challenge page
 * instead of JSON. Backups only — the primary always comes from rpcEndpoints.
 */
const evmBackupEndpoints: Record<string, string[]> = {
  ethereum: ['https://eth.drpc.org', 'https://1rpc.io/eth'],
}

const getEvmEndpoints = (chain: string, primary: string): string[] => [
  primary,
  ...(evmBackupEndpoints[chain] ?? []),
]

type EvmReceipt = { status: string; blockNumber: string; gasUsed: string }

async function fetchEvmReceipt(
  rpcUrl: string,
  txHash: string
): Promise<EvmReceipt | null> {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getTransactionReceipt',
      params: [txHash],
      id: 1,
    }),
  })
  const body = await response.text()
  if (!body.trimStart().startsWith('{')) {
    throw new Error(`non-JSON body from ${rpcUrl}: ${body.slice(0, 40)}`)
  }
  const { result, error } = JSON.parse(body) as {
    result?: EvmReceipt | null
    error?: { message?: string }
  }
  if (error) {
    throw new Error(`RPC error from ${rpcUrl}: ${error.message ?? 'unknown'}`)
  }
  return result ?? null
}

/**
 * Poll for EVM transaction confirmation
 */
async function pollEvmTx(
  chain: string,
  primaryUrl: string,
  txHash: string,
  timeoutMs: number
): Promise<TxConfirmationResult> {
  const startTime = Date.now()
  const pollInterval = 3000
  const endpoints = getEvmEndpoints(chain, primaryUrl)
  let attempt = 0

  while (Date.now() - startTime < timeoutMs) {
    const rpcUrl = endpoints[attempt++ % endpoints.length]
    try {
      const receipt = await fetchEvmReceipt(rpcUrl, txHash)
      if (receipt) {
        const confirmed = receipt.status === '0x1'
        return {
          confirmed,
          blockNumber: parseInt(receipt.blockNumber, 16),
          gasUsed: BigInt(receipt.gasUsed),
          error: confirmed ? undefined : 'Transaction reverted',
        }
      }
    } catch (error) {
      console.warn('EVM poll error:', error)
    }

    await new Promise(r => setTimeout(r, pollInterval))
  }

  return {
    confirmed: false,
    blockNumber: null,
    gasUsed: null,
    error: `Timeout waiting for confirmation after ${timeoutMs}ms`,
  }
}

/**
 * Poll for UTXO transaction in mempool (Bitcoin, Litecoin, etc.)
 *
 * For E2E tests, we only verify the tx is BROADCAST (seen in mempool).
 * We don't wait for block confirmation since UTXO chains can take 10+ minutes.
 * "Broadcast successful" = tx exists in mempool = confirmed: true
 */
async function pollUtxoTx(
  apiUrl: string,
  txHash: string,
  timeoutMs: number,
  chain: string
): Promise<TxConfirmationResult> {
  const startTime = Date.now()
  const pollInterval = 3000 // Check frequently since we're just looking for mempool presence

  while (Date.now() - startTime < timeoutMs) {
    try {
      if (chain === 'bitcoin' || chain === 'litecoin') {
        // Mempool.space API - check if tx EXISTS (in mempool OR confirmed)
        const response = await fetch(`${apiUrl}/tx/${txHash}`)

        if (response.ok) {
          const data = await response.json()

          // Tx exists! Could be in mempool (unconfirmed) or in a block (confirmed)
          // Either way, broadcast was successful - that's all we need for E2E
          const inMempool = data.txid === txHash
          const inBlock = data.status?.confirmed === true

          if (inMempool || inBlock) {
            const blockNumber = inBlock ? data.status.block_height : null
            console.log(
              `✅ ${chain} tx ${txHash.slice(0, 16)}... found in ${inBlock ? 'block ' + blockNumber : 'mempool'}`
            )
            return {
              confirmed: true, // "confirmed" means "broadcast successful" for E2E
              blockNumber,
              gasUsed: null,
            }
          }
        }
      } else if (chain === 'dogecoin') {
        // Dogechain API
        const response = await fetch(`${apiUrl}/transaction/${txHash}`)

        if (response.ok) {
          const data = await response.json()

          if (data.transaction) {
            // Tx exists - broadcast successful
            const blockNumber = data.transaction.block_height || null
            console.log(`✅ ${chain} tx found`)
            return {
              confirmed: true,
              blockNumber,
              gasUsed: null,
            }
          }
        }
      }
    } catch (error) {
      console.warn('UTXO poll error:', error)
    }

    await new Promise(r => setTimeout(r, pollInterval))
  }

  return {
    confirmed: false,
    blockNumber: null,
    gasUsed: null,
    error: 'Timeout waiting for tx to appear in mempool',
  }
}

/**
 * Poll for Cosmos transaction confirmation
 */
async function pollCosmosTx(
  restUrl: string,
  txHash: string,
  timeoutMs: number
): Promise<TxConfirmationResult> {
  const startTime = Date.now()
  const pollInterval = 5000

  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await fetch(`${restUrl}/cosmos/tx/v1beta1/txs/${txHash}`)

      if (response.ok) {
        const data = await response.json()

        if (data.tx_response) {
          const txResponse = data.tx_response
          const confirmed = txResponse.code === 0
          const blockNumber = parseInt(txResponse.height, 10)
          const gasUsed = BigInt(txResponse.gas_used || 0)

          return {
            confirmed,
            blockNumber,
            gasUsed,
            error: confirmed ? undefined : txResponse.raw_log,
          }
        }
      }
    } catch (error) {
      console.warn('Cosmos poll error:', error)
    }

    await new Promise(r => setTimeout(r, pollInterval))
  }

  return {
    confirmed: false,
    blockNumber: null,
    gasUsed: null,
    error: 'Timeout waiting for confirmation',
  }
}

/**
 * Poll for Solana transaction confirmation
 */
async function pollSolanaTx(
  rpcUrl: string,
  signature: string,
  timeoutMs: number
): Promise<TxConfirmationResult> {
  const startTime = Date.now()
  const pollInterval = 2000

  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'getSignatureStatuses',
          params: [[signature], { searchTransactionHistory: true }],
          id: 1,
        }),
      })

      const data = await response.json()

      if (data.result?.value?.[0]) {
        const status = data.result.value[0]

        if (
          status.confirmationStatus === 'finalized' ||
          status.confirmationStatus === 'confirmed'
        ) {
          return {
            confirmed: status.err === null,
            blockNumber: status.slot,
            gasUsed: null, // Solana uses compute units, not gas
            error: status.err ? JSON.stringify(status.err) : undefined,
          }
        }
      }
    } catch (error) {
      console.warn('Solana poll error:', error)
    }

    await new Promise(r => setTimeout(r, pollInterval))
  }

  return {
    confirmed: false,
    blockNumber: null,
    gasUsed: null,
    error: 'Timeout waiting for confirmation',
  }
}

/**
 * Wait for transaction confirmation on any supported chain
 *
 * @param chain - Chain name (ethereum, bitcoin, solana, etc.)
 * @param txHash - Transaction hash or signature
 * @param timeoutMs - Maximum time to wait (default 120 seconds)
 */
export async function waitForTxConfirmation(
  chain: string,
  txHash: string,
  timeoutMs = defaultConfirmationTimeoutMs
): Promise<TxConfirmationResult> {
  const chainLower = chain.toLowerCase()
  const family = getChainFamily(chainLower)
  const endpoint = rpcEndpoints[chainLower]

  if (!endpoint) {
    return {
      confirmed: false,
      blockNumber: null,
      gasUsed: null,
      error: `Unknown chain: ${chain}`,
    }
  }

  // For UTXO chains, we only check mempool presence (not block confirmation)
  const waitType = family === 'utxo' ? 'mempool broadcast' : 'confirmation'
  console.log(`Waiting for ${chain} tx ${txHash.slice(0, 16)}... (${waitType})`)

  switch (family) {
    case 'evm':
      return pollEvmTx(chainLower, endpoint, txHash, timeoutMs)

    case 'utxo':
      // Shorter timeout for UTXO since we're just checking mempool, not block confirmation
      return pollUtxoTx(
        endpoint,
        txHash,
        Math.min(timeoutMs, 30_000),
        chainLower
      )

    case 'cosmos':
      return pollCosmosTx(endpoint, txHash, timeoutMs)

    case 'solana':
      return pollSolanaTx(endpoint, txHash, timeoutMs)

    default:
      return {
        confirmed: false,
        blockNumber: null,
        gasUsed: null,
        error: `Unsupported chain family: ${family}`,
      }
  }
}

/**
 * Check if a transaction is already confirmed (single check, no polling)
 */
export async function isTxConfirmed(
  chain: string,
  txHash: string
): Promise<boolean> {
  const result = await waitForTxConfirmation(chain, txHash, 5000)
  return result.confirmed
}

/**
 * Get RPC endpoint for a chain
 */
export function getRpcEndpoint(chain: string): string | undefined {
  return rpcEndpoints[chain.toLowerCase()]
}

/**
 * Get chain family for a chain
 */
export function getChainFamilyForChain(chain: string): ChainFamily {
  return getChainFamily(chain)
}

/** Outcome of waiting on THORChain's tx status; stage is the last completed stage seen. */
export type ThorchainSwapSettlement = {
  settled: boolean
  stage: string
  error?: string
}

type ThorchainTxStatus = {
  stages?: Record<string, { completed?: boolean }>
  planned_out_txs?: { refund?: boolean }[]
  out_txs?: { memo?: string }[]
}

const thorchainStageOrder = [
  'inbound_observed',
  'inbound_confirmation_counted',
  'inbound_finalised',
  'swap_finalised',
  'outbound_delay',
  'outbound_signed',
]

const latestCompletedStage = (stages: ThorchainTxStatus['stages']): string =>
  thorchainStageOrder.filter(stage => stages?.[stage]?.completed).at(-1) ??
  'none'

// swap_finalised flips for refunds too; the refund shows up on the outbound.
const isRefunded = ({ planned_out_txs, out_txs }: ThorchainTxStatus): boolean =>
  (planned_out_txs ?? []).some(tx => tx.refund === true) ||
  (out_txs ?? []).some(tx => tx.memo?.startsWith('REFUND:'))

const isSwapSettled = ({ stages }: ThorchainTxStatus): boolean =>
  stages?.swap_finalised?.completed === true &&
  stages?.outbound_signed?.completed === true

/**
 * Poll THORChain's tx status until the swap finalised AND its outbound was
 * signed as a swap output, not a refund. Source-chain inclusion only proves
 * the deposit landed.
 */
export async function waitForThorchainSwapSettlement(
  txHash: string,
  timeoutMs = defaultConfirmationTimeoutMs
): Promise<ThorchainSwapSettlement> {
  const startTime = Date.now()
  const pollInterval = 10_000
  const hash = txHash.trim().replace(/^0x/i, '')
  const url = `${rpcEndpoints.thorchain}/thorchain/tx/status/${hash}`
  let stage = 'none'

  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        const status = (await response.json()) as ThorchainTxStatus
        stage = latestCompletedStage(status.stages)
        if (isRefunded(status)) {
          return {
            settled: false,
            stage: 'refunded',
            error: `THORChain refunded ${hash} instead of swapping (last stage: ${stage})`,
          }
        }
        if (isSwapSettled(status)) return { settled: true, stage }
      }
    } catch (error) {
      console.warn('THORChain status poll error:', error)
    }
    await new Promise(r => setTimeout(r, pollInterval))
  }

  return {
    settled: false,
    stage,
    error: `Timeout waiting for THORChain swap settlement after ${timeoutMs}ms (last stage: ${stage})`,
  }
}
