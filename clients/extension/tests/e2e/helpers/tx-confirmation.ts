/**
 * Transaction Confirmation Helpers
 *
 * Polls for on-chain transaction confirmation across different chain families.
 * Supports: EVM, UTXO (Bitcoin), Cosmos, Solana
 */

/**
 * TX confirmation result
 */
export interface TxConfirmationResult {
  confirmed: boolean
  blockNumber: number | null
  gasUsed: bigint | null
  error?: string
}

/**
 * Chain family type
 */
type ChainFamily = 'evm' | 'utxo' | 'cosmos' | 'solana'

/**
 * RPC endpoints for different chains
 */
const RPC_ENDPOINTS: Record<string, string> = {
  // EVM chains
  ethereum: 'https://eth.llamarpc.com',
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
  thorchain: 'https://thornode.thorchain.network',

  // Solana
  solana: 'https://api.mainnet-beta.solana.com',
}

/**
 * Determine chain family from chain name
 */
function getChainFamily(chain: string): ChainFamily {
  const evmChains = ['ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'avalanche', 'base']
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
 * Poll for EVM transaction confirmation
 */
async function pollEvmTx(
  rpcUrl: string,
  txHash: string,
  timeoutMs: number
): Promise<TxConfirmationResult> {
  const startTime = Date.now()
  const pollInterval = 3000

  while (Date.now() - startTime < timeoutMs) {
    try {
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

      const data = await response.json()

      if (data.result) {
        const receipt = data.result
        const confirmed = receipt.status === '0x1'
        const blockNumber = parseInt(receipt.blockNumber, 16)
        const gasUsed = BigInt(receipt.gasUsed)

        return {
          confirmed,
          blockNumber,
          gasUsed,
          error: confirmed ? undefined : 'Transaction reverted',
        }
      }
    } catch (error) {
      console.warn('EVM poll error:', error)
    }

    await new Promise((r) => setTimeout(r, pollInterval))
  }

  return {
    confirmed: false,
    blockNumber: null,
    gasUsed: null,
    error: 'Timeout waiting for confirmation',
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
            console.log(`✅ ${chain} tx ${txHash.slice(0, 16)}... found in ${inBlock ? 'block ' + blockNumber : 'mempool'}`)
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

    await new Promise((r) => setTimeout(r, pollInterval))
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

    await new Promise((r) => setTimeout(r, pollInterval))
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

        if (status.confirmationStatus === 'finalized' || status.confirmationStatus === 'confirmed') {
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

    await new Promise((r) => setTimeout(r, pollInterval))
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
  timeoutMs = 120_000
): Promise<TxConfirmationResult> {
  const chainLower = chain.toLowerCase()
  const family = getChainFamily(chainLower)
  const endpoint = RPC_ENDPOINTS[chainLower]

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
      return pollEvmTx(endpoint, txHash, timeoutMs)

    case 'utxo':
      // Shorter timeout for UTXO since we're just checking mempool, not block confirmation
      return pollUtxoTx(endpoint, txHash, Math.min(timeoutMs, 30_000), chainLower)

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
export async function isTxConfirmed(chain: string, txHash: string): Promise<boolean> {
  const result = await waitForTxConfirmation(chain, txHash, 5000)
  return result.confirmed
}

/**
 * Get RPC endpoint for a chain
 */
export function getRpcEndpoint(chain: string): string | undefined {
  return RPC_ENDPOINTS[chain.toLowerCase()]
}

/**
 * Get chain family for a chain
 */
export function getChainFamilyForChain(chain: string): ChainFamily {
  return getChainFamily(chain)
}
