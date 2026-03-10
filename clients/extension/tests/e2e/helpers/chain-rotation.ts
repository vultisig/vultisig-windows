/**
 * Chain Rotation Algorithm
 *
 * Selects chains for testing based on staleness (time since last tested).
 * Ensures fair coverage across all supported chains over time.
 * 
 * IMPORTANT: Only chains with known funded status are selected for testing.
 * Update FUNDED_CHAINS when vault balances change.
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

// ESM compatibility for __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// State file location
const STATE_FILE = path.join(__dirname, '../../.chain-rotation-state.json')

/**
 * Chain rotation state structure
 */
interface ChainState {
  lastTested: number // Unix timestamp
  successCount: number
  failureCount: number
}

interface RotationState {
  chains: Record<string, ChainState>
  lastUpdated: number
}

/**
 * Supported chains for testing
 */
export const SUPPORTED_CHAINS = {
  // EVM chains
  ethereum: { symbol: 'ETH', minSend: '0.001', minSwap: '0.01' },
  bsc: { symbol: 'BNB', minSend: '0.001', minSwap: '0.01' },
  polygon: { symbol: 'MATIC', minSend: '0.1', minSwap: '1' },
  arbitrum: { symbol: 'ETH', minSend: '0.0005', minSwap: '0.005' },
  optimism: { symbol: 'ETH', minSend: '0.0005', minSwap: '0.005' },
  avalanche: { symbol: 'AVAX', minSend: '0.01', minSwap: '0.1' },
  base: { symbol: 'ETH', minSend: '0.0005', minSwap: '0.005' },

  // UTXO chains
  bitcoin: { symbol: 'BTC', minSend: '0.00005', minSwap: '0.0005' },
  litecoin: { symbol: 'LTC', minSend: '0.001', minSwap: '0.01' },
  dogecoin: { symbol: 'DOGE', minSend: '1', minSwap: '10' },

  // Other chains
  solana: { symbol: 'SOL', minSend: '0.01', minSwap: '0.02' },
  thorchain: { symbol: 'RUNE', minSend: '0.1', minSwap: '1' },
  cosmos: { symbol: 'ATOM', minSend: '0.01', minSwap: '0.1' },
} as const

export type ChainId = keyof typeof SUPPORTED_CHAINS

/**
 * Chains that are known to have funds in the test vault.
 * Update this list when vault balances change!
 * 
 * Current balances (as of 2026-03-10):
 * - THOR: ~27 RUNE ($27) - good swap source
 * - ETH: $15.67 - good swap source  
 * - SOL: ~0.033 SOL ($2.90) - destination only
 * - BTC: $0.00 (no funds!) - REMOVED
 * - BSC: $0 (no funds)
 * - Polygon: $0 (no funds)
 * 
 * NOTE: Order matters for swap pairs! Higher balance chains first.
 * Last chain becomes destination-only (never a source).
 */
export const FUNDED_CHAINS: ChainId[] = [
  'thorchain', // ~$27 - best swap source (native THORChain routes)
  'ethereum',  // $15.67 - good swap source
  'solana',    // $2.90  - destination only (too low for source)
]

/**
 * Chains suitable for being swap source (enough balance for minSwap)
 * SOL excluded - $2.90 balance too low for reliable swaps
 * BTC excluded - $0.00 balance (no funds in test vault)
 * ETH excluded - swap routing unreliable for cross-chain swaps in tests
 * 
 * THORChain is the only reliable swap source (native THORSwap routing).
 */
export const SWAP_SOURCE_CHAINS: ChainId[] = [
  'thorchain',
]

/**
 * Generate cross-chain native swap pairs.
 * Only swaps native/gas tokens between different chains for better liquidity.
 * Uses SWAP_SOURCE_CHAINS as sources (enough balance) and FUNDED_CHAINS as destinations.
 * 
 * IMPORTANT: Only pairs with reliable quotes and sufficient balance!
 * BTC excluded - test vault has $0.00 BTC balance.
 * ETH→SOL excluded - SOL selection fails from ETH starting point (UI/routing issue).
 * 
 * Using THORChain-based swaps for reliability (native routing via THORSwap):
 * - THOR→ETH: proven working, best liquidity
 * - THOR→SOL: proven working (tx 3269A928...91DB on 2026-03-10)
 */
export function generateNativeSwapPairs(): [ChainId, ChainId][] {
  // Hand-picked pairs for reliable quotes - both verified working!
  // THORChain swaps use native THORSwap routing for best liquidity
  return [
    ['thorchain', 'ethereum'], // RUNE → ETH (native THORChain pair, known working!)
    ['thorchain', 'solana'],   // RUNE → SOL (proven working - tx 3269A928...91DB)
  ]
}

/**
 * Swap pairs - cross-chain native token swaps only.
 * Generated dynamically from FUNDED_CHAINS.
 */
export const SWAP_PAIRS: [ChainId, ChainId][] = generateNativeSwapPairs()

/**
 * Load rotation state from disk
 */
function loadState(): RotationState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.warn('Failed to load chain rotation state:', error)
  }

  // Initialize fresh state
  const chains: Record<string, ChainState> = {}
  for (const chain of Object.keys(SUPPORTED_CHAINS)) {
    chains[chain] = {
      lastTested: 0,
      successCount: 0,
      failureCount: 0,
    }
  }

  return {
    chains,
    lastUpdated: Date.now(),
  }
}

/**
 * Save rotation state to disk
 */
function saveState(state: RotationState): void {
  try {
    const dir = path.dirname(STATE_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))
  } catch (error) {
    console.warn('Failed to save chain rotation state:', error)
  }
}

/**
 * Calculate staleness score for a chain
 * Higher score = more stale = should be tested
 */
function getStalenessScore(chainState: ChainState): number {
  const now = Date.now()
  const hoursSinceLastTest = (now - chainState.lastTested) / (1000 * 60 * 60)

  // Base score is hours since last test
  let score = hoursSinceLastTest

  // Reduce score if chain has high failure rate (flaky)
  const totalTests = chainState.successCount + chainState.failureCount
  if (totalTests > 0) {
    const failureRate = chainState.failureCount / totalTests
    if (failureRate > 0.5) {
      score *= 0.5 // Deprioritize highly flaky chains
    }
  }

  return score
}

/**
 * Select chains for the current test run
 *
 * @param sendCount - Number of chains to select for send tests (default 2)
 * @param swapPairCount - Number of swap pairs to select (default 2)
 * @param onlyFunded - Only select chains known to have funds (default true)
 */
export function selectChainsForRun(
  sendCount = 2,
  swapPairCount = 2,
  onlyFunded = true
): {
  sendChains: ChainId[]
  swapPairs: [ChainId, ChainId][]
} {
  const state = loadState()

  // Filter to only funded chains if requested
  const availableChains = onlyFunded 
    ? FUNDED_CHAINS 
    : (Object.keys(SUPPORTED_CHAINS) as ChainId[])

  // Sort chains by staleness (most stale first)
  const sortedChains = availableChains.sort(
    (a, b) => getStalenessScore(state.chains[b]) - getStalenessScore(state.chains[a])
  )

  // Select top N chains for send tests
  const sendChains = sortedChains.slice(0, sendCount)

  // Filter swap pairs to only include funded chains if requested
  const availableSwapPairs = onlyFunded
    ? SWAP_PAIRS.filter(([a, b]) => FUNDED_CHAINS.includes(a) && FUNDED_CHAINS.includes(b))
    : SWAP_PAIRS

  // Sort swap pairs by combined staleness of both chains
  const sortedSwapPairs = [...availableSwapPairs].sort((a, b) => {
    const scoreA = getStalenessScore(state.chains[a[0]]) + getStalenessScore(state.chains[a[1]])
    const scoreB = getStalenessScore(state.chains[b[0]]) + getStalenessScore(state.chains[b[1]])
    return scoreB - scoreA
  })

  // Select top N swap pairs
  const swapPairs = sortedSwapPairs.slice(0, swapPairCount)

  return { sendChains, swapPairs }
}

/**
 * Update staleness after testing chains
 *
 * @param chains - Array of chain IDs that were tested
 * @param success - Whether the tests passed
 */
export function updateStaleness(chains: ChainId[], success: boolean): void {
  const state = loadState()

  for (const chain of chains) {
    if (state.chains[chain]) {
      state.chains[chain].lastTested = Date.now()
      if (success) {
        state.chains[chain].successCount++
      } else {
        state.chains[chain].failureCount++
      }
    }
  }

  state.lastUpdated = Date.now()
  saveState(state)
}

/**
 * Get current rotation state for debugging
 */
export function getRotationState(): RotationState {
  return loadState()
}

/**
 * Reset rotation state
 */
export function resetRotationState(): void {
  if (fs.existsSync(STATE_FILE)) {
    fs.unlinkSync(STATE_FILE)
  }
}

/**
 * Print a summary of chain test coverage
 */
export function printCoverageSummary(): void {
  const state = loadState()
  const now = Date.now()

  console.log('\n=== Chain Test Coverage Summary ===\n')

  const entries = Object.entries(state.chains)
    .sort(([, a], [, b]) => b.lastTested - a.lastTested)

  for (const [chain, chainState] of entries) {
    const hoursSince = chainState.lastTested
      ? ((now - chainState.lastTested) / (1000 * 60 * 60)).toFixed(1)
      : 'never'
    const total = chainState.successCount + chainState.failureCount
    const successRate = total > 0
      ? ((chainState.successCount / total) * 100).toFixed(0)
      : 'N/A'

    console.log(
      `${chain.padEnd(15)} | Last: ${hoursSince.padStart(8)}h ago | ` +
      `Success: ${successRate.padStart(3)}% (${chainState.successCount}/${total})`
    )
  }

  console.log()
}
