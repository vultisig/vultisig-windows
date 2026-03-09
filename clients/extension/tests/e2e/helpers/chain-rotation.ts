/**
 * Chain Rotation Algorithm
 *
 * Selects chains for testing based on staleness (time since last tested).
 * Ensures fair coverage across all supported chains over time.
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
  solana: { symbol: 'SOL', minSend: '0.01', minSwap: '0.1' },
  thorchain: { symbol: 'RUNE', minSend: '0.1', minSwap: '1' },
  cosmos: { symbol: 'ATOM', minSend: '0.01', minSwap: '0.1' },
} as const

export type ChainId = keyof typeof SUPPORTED_CHAINS

/**
 * Swap pairs - chains that can be swapped between
 */
export const SWAP_PAIRS: [ChainId, ChainId][] = [
  ['ethereum', 'bitcoin'],
  ['ethereum', 'arbitrum'],
  ['bsc', 'ethereum'],
  ['polygon', 'ethereum'],
  ['avalanche', 'ethereum'],
  ['solana', 'ethereum'],
  ['thorchain', 'ethereum'],
  ['bitcoin', 'litecoin'],
  ['bitcoin', 'dogecoin'],
  ['cosmos', 'thorchain'],
]

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
 */
export function selectChainsForRun(
  sendCount = 2,
  swapPairCount = 2
): {
  sendChains: ChainId[]
  swapPairs: [ChainId, ChainId][]
} {
  const state = loadState()

  // Sort chains by staleness (most stale first)
  const sortedChains = (Object.keys(SUPPORTED_CHAINS) as ChainId[]).sort(
    (a, b) => getStalenessScore(state.chains[b]) - getStalenessScore(state.chains[a])
  )

  // Select top N chains for send tests
  const sendChains = sortedChains.slice(0, sendCount)

  // Sort swap pairs by combined staleness of both chains
  const sortedSwapPairs = [...SWAP_PAIRS].sort((a, b) => {
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
