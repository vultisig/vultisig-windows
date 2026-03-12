/**
 * Fund Manager
 *
 * Utilities for checking test wallet balances and determining
 * if there are sufficient funds for send/swap tests.
 */

import { SUPPORTED_CHAINS, ChainId } from './chain-rotation'

/**
 * Balance information for a chain
 */
interface ChainBalance {
  chain: ChainId
  symbol: string
  balance: string
  balanceUsd: number
  sufficient: boolean
  sufficientForSend: boolean
  sufficientForSwap: boolean
}

/**
 * Fund status report
 */
interface FundStatus {
  totalUsd: number
  chains: ChainBalance[]
  lowFunds: ChainId[]
  timestamp: number
}

/**
 * Minimum balance thresholds in USD
 */
const MIN_BALANCE_USD = {
  send: 1, // $1 minimum for send tests
  swap: 10, // $10 minimum for swap tests (need more for fees + slippage)
}

/**
 * Mock price data (in production, fetch from CoinGecko or similar)
 * These are approximate prices for test planning purposes
 */
const MOCK_PRICES_USD: Record<string, number> = {
  ETH: 3500,
  BTC: 65000,
  BNB: 600,
  MATIC: 0.5,
  AVAX: 35,
  SOL: 150,
  ATOM: 10,
  RUNE: 5,
  LTC: 100,
  DOGE: 0.15,
}

/**
 * Parse balance string to number
 */
function parseBalance(balance: string): number {
  const cleaned = balance.replace(/[^0-9.]/g, '')
  return parseFloat(cleaned) || 0
}

/**
 * Get USD value of a balance
 */
function getUsdValue(symbol: string, balance: number): number {
  const price = MOCK_PRICES_USD[symbol] || 0
  return balance * price
}

/**
 * Check balances for all test chains
 *
 * In a real implementation, this would query actual chain balances
 * via RPC or an API. For now, this is a mock implementation.
 *
 * @param addresses - Map of chain ID to wallet address
 */
export async function checkFundedChains(
  addresses: Record<ChainId, string>
): Promise<FundStatus> {
  const chains: ChainBalance[] = []
  const lowFunds: ChainId[] = []
  let totalUsd = 0

  for (const [chainId, chainConfig] of Object.entries(SUPPORTED_CHAINS)) {
    const chain = chainId as ChainId
    const address = addresses[chain]

    if (!address) {
      // No address configured for this chain
      chains.push({
        chain,
        symbol: chainConfig.symbol,
        balance: '0',
        balanceUsd: 0,
        sufficient: false,
        sufficientForSend: false,
        sufficientForSwap: false,
      })
      lowFunds.push(chain)
      continue
    }

    // In production, fetch actual balance here
    // For now, return mock data
    const mockBalance = '0' // Would be actual balance
    const balanceNum = parseBalance(mockBalance)
    const balanceUsd = getUsdValue(chainConfig.symbol, balanceNum)

    const sufficientForSend = balanceNum >= parseFloat(chainConfig.minSend)
    const sufficientForSwap = balanceNum >= parseFloat(chainConfig.minSwap)

    chains.push({
      chain,
      symbol: chainConfig.symbol,
      balance: mockBalance,
      balanceUsd,
      sufficient: sufficientForSend || sufficientForSwap,
      sufficientForSend,
      sufficientForSwap,
    })

    if (!sufficientForSend) {
      lowFunds.push(chain)
    }

    totalUsd += balanceUsd
  }

  return {
    totalUsd,
    chains,
    lowFunds,
    timestamp: Date.now(),
  }
}

/**
 * Print formatted fund status table
 */
export function reportFundStatus(status: FundStatus): void {
  console.log('\n=== Test Wallet Fund Status ===\n')
  console.log(`Total Balance: $${status.totalUsd.toFixed(2)} USD`)
  console.log(`Timestamp: ${new Date(status.timestamp).toISOString()}\n`)

  // Header
  console.log(
    'Chain'.padEnd(15) +
    'Symbol'.padEnd(8) +
    'Balance'.padEnd(15) +
    'USD'.padEnd(12) +
    'Send'.padEnd(8) +
    'Swap'
  )
  console.log('-'.repeat(70))

  // Rows
  for (const chain of status.chains) {
    const sendStatus = chain.sufficientForSend ? '✓' : '✗'
    const swapStatus = chain.sufficientForSwap ? '✓' : '✗'

    console.log(
      chain.chain.padEnd(15) +
      chain.symbol.padEnd(8) +
      chain.balance.padEnd(15) +
      `$${chain.balanceUsd.toFixed(2)}`.padEnd(12) +
      sendStatus.padEnd(8) +
      swapStatus
    )
  }

  console.log()

  if (status.lowFunds.length > 0) {
    console.log(`⚠️  Low funds on: ${status.lowFunds.join(', ')}`)
    console.log()
  }
}

/**
 * Check if a chain has sufficient funds for send test
 */
export function isSufficientForSend(
  chain: ChainId,
  balance: string
): boolean {
  const chainConfig = SUPPORTED_CHAINS[chain]
  if (!chainConfig) return false

  const balanceNum = parseBalance(balance)
  const minRequired = parseFloat(chainConfig.minSend)

  return balanceNum >= minRequired
}

/**
 * Check if a chain has sufficient funds for swap test
 */
export function isSufficientForSwap(
  chain: ChainId,
  balance: string
): boolean {
  const chainConfig = SUPPORTED_CHAINS[chain]
  if (!chainConfig) return false

  const balanceNum = parseBalance(balance)
  const minRequired = parseFloat(chainConfig.minSwap)

  return balanceNum >= minRequired
}

/**
 * Get minimum amount required for send test
 */
export function getMinSendAmount(chain: ChainId): string {
  return SUPPORTED_CHAINS[chain]?.minSend || '0'
}

/**
 * Get minimum amount required for swap test
 */
export function getMinSwapAmount(chain: ChainId): string {
  return SUPPORTED_CHAINS[chain]?.minSwap || '0'
}

/**
 * Get chain symbol
 */
export function getChainSymbol(chain: ChainId): string {
  return SUPPORTED_CHAINS[chain]?.symbol || ''
}

/**
 * Filter chains that have sufficient funds for testing
 */
export function getTestableChains(
  balances: Record<ChainId, string>,
  testType: 'send' | 'swap'
): ChainId[] {
  const checkFn = testType === 'send' ? isSufficientForSend : isSufficientForSwap

  return (Object.keys(balances) as ChainId[]).filter((chain) =>
    checkFn(chain, balances[chain])
  )
}

/**
 * Generate funding recommendations
 */
export function getFundingRecommendations(
  status: FundStatus
): Array<{ chain: ChainId; amount: string; symbol: string; reason: string }> {
  const recommendations: Array<{
    chain: ChainId
    amount: string
    symbol: string
    reason: string
  }> = []

  for (const chain of status.chains) {
    if (!chain.sufficientForSend) {
      const minSend = SUPPORTED_CHAINS[chain.chain].minSend
      recommendations.push({
        chain: chain.chain,
        amount: minSend,
        symbol: chain.symbol,
        reason: `Need at least ${minSend} ${chain.symbol} for send tests`,
      })
    } else if (!chain.sufficientForSwap) {
      const minSwap = SUPPORTED_CHAINS[chain.chain].minSwap
      recommendations.push({
        chain: chain.chain,
        amount: minSwap,
        symbol: chain.symbol,
        reason: `Need at least ${minSwap} ${chain.symbol} for swap tests`,
      })
    }
  }

  return recommendations
}
