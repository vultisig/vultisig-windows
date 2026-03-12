/**
 * Dynamic Swap Selection
 * 
 * Dynamically selects swap pairs based on actual vault balances.
 * - Source: chain with sufficient balance (> minSwapUsd)
 * - Destination: chain with lowest balance (self-balancing)
 * - Amount: actual USD value, not percentage
 */

import { Page } from '@playwright/test'

export interface ChainBalance {
  chainId: string
  symbol: string
  balance: number      // Token amount
  balanceUsd: number   // USD value
}

export interface SwapConfig {
  fromChain: string
  toChain: string
  fromSymbol: string
  toSymbol: string
  amount: string       // Actual token amount to swap
  amountUsd: number    // USD value for logging
}

// Minimum USD value required for a swap source
const MIN_SWAP_USD = 2.00

// Target swap amount in USD
const TARGET_SWAP_USD = 2.00

// Chain symbols (extension uses these in UI)
const CHAIN_SYMBOLS: Record<string, string> = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
  thorchain: 'RUNE',
  solana: 'SOL',
  bsc: 'BNB',
  polygon: 'MATIC',
  arbitrum: 'ETH',
  optimism: 'ETH',
  avalanche: 'AVAX',
  base: 'ETH',
  litecoin: 'LTC',
  dogecoin: 'DOGE',
  cosmos: 'ATOM',
}

// Chains available for swaps in extension UI (only BTC ↔ ETH)
const SWAPPABLE_CHAINS = ['bitcoin', 'ethereum']

/**
 * Parse balances from the vault page.
 * Reads the portfolio display to get current balances.
 */
export async function getVaultBalances(page: Page): Promise<ChainBalance[]> {
  const balances: ChainBalance[] = []
  
  // Wait for balances to load
  await page.waitForTimeout(2000)
  
  // Get the full page text to parse balances
  const pageText = await page.locator('body').textContent() || ''
  
  // Parse each chain's balance from the vault display
  // Format in UI: "Ethereum0x1a2...f334$40.2212 assets" or "Bitcoin bc1qj...rfea$0.000 BTC"
  
  for (const [chainId, symbol] of Object.entries(CHAIN_SYMBOLS)) {
    // Only consider swappable chains
    if (!SWAPPABLE_CHAINS.includes(chainId)) continue
    
    // Look for balance pattern: $XX.XX or $X,XXX.XX
    const chainNamePattern = chainId.charAt(0).toUpperCase() + chainId.slice(1)
    const balanceMatch = pageText.match(new RegExp(`${chainNamePattern}[^$]*\\$(\\d+[,.]?\\d*\\.?\\d*)`, 'i'))
    
    if (balanceMatch) {
      const usdValue = parseFloat(balanceMatch[1].replace(',', ''))
      
      // Try to extract token balance
      const tokenMatch = pageText.match(new RegExp(`(\\d+\\.\\d+)\\s*${symbol}`, 'i'))
      const tokenBalance = tokenMatch ? parseFloat(tokenMatch[1]) : 0
      
      balances.push({
        chainId,
        symbol,
        balance: tokenBalance,
        balanceUsd: usdValue,
      })
      
      console.log(`  ${chainId}: $${usdValue.toFixed(2)} (${tokenBalance} ${symbol})`)
    }
  }
  
  return balances
}

/**
 * Select the best swap pair based on current balances.
 * 
 * Strategy:
 * - Source: chain with highest balance above MIN_SWAP_USD
 * - Destination: chain with lowest balance (self-balancing)
 * - Amount: TARGET_SWAP_USD worth of source token
 * 
 * Returns null if no valid swap pair can be formed.
 */
export function selectSwapPair(balances: ChainBalance[]): SwapConfig | null {
  // Filter to chains with enough balance to be a source
  const validSources = balances
    .filter(b => b.balanceUsd >= MIN_SWAP_USD)
    .sort((a, b) => b.balanceUsd - a.balanceUsd) // Highest first
  
  if (validSources.length === 0) {
    console.log('❌ No chains have sufficient balance for swap')
    return null
  }
  
  // Find destination: lowest balance chain (different from source)
  const source = validSources[0]
  const destinations = balances
    .filter(b => b.chainId !== source.chainId)
    .sort((a, b) => a.balanceUsd - b.balanceUsd) // Lowest first
  
  if (destinations.length === 0) {
    console.log('❌ No destination chain available')
    return null
  }
  
  const dest = destinations[0]
  
  // Calculate amount: TARGET_SWAP_USD worth of source token
  // If we don't have token balance, use a reasonable default
  let amount: string
  if (source.balance > 0 && source.balanceUsd > 0) {
    const pricePerToken = source.balanceUsd / source.balance
    const tokensNeeded = TARGET_SWAP_USD / pricePerToken
    // Round to reasonable precision
    amount = tokensNeeded.toFixed(source.symbol === 'BTC' ? 8 : 6)
  } else {
    // Fallback: use small fixed amounts
    const fallbacks: Record<string, string> = {
      ETH: '0.0008',
      BTC: '0.00003',
      RUNE: '0.5',
      SOL: '0.02',
    }
    amount = fallbacks[source.symbol] || '0.001'
  }
  
  console.log(`\n📊 Selected swap pair:`)
  console.log(`  Source: ${source.chainId} ($${source.balanceUsd.toFixed(2)})`)
  console.log(`  Dest:   ${dest.chainId} ($${dest.balanceUsd.toFixed(2)})`)
  console.log(`  Amount: ${amount} ${source.symbol} (~$${TARGET_SWAP_USD})`)
  
  return {
    fromChain: source.chainId,
    toChain: dest.chainId,
    fromSymbol: source.symbol,
    toSymbol: dest.symbol,
    amount,
    amountUsd: TARGET_SWAP_USD,
  }
}

/**
 * Check if a swap is possible with current balances.
 */
export function canSwap(balances: ChainBalance[]): boolean {
  const validSources = balances.filter(b => b.balanceUsd >= MIN_SWAP_USD)
  return validSources.length > 0 && balances.length >= 2
}
