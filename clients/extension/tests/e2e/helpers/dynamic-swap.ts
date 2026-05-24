import { Page } from '@playwright/test'

/** Chain balance entry parsed from the vault portfolio UI. */
export type ChainBalance = {
  chainId: string
  symbol: string
  balance: number
  balanceUsd: number
}

/** Resolved swap configuration (source + destination + amount). */
export type SwapConfig = {
  fromChain: string
  toChain: string
  fromSymbol: string
  toSymbol: string
  amount: string
  amountUsd: number
}

const readUsdEnv = (name: string, fallback: number): number => {
  const raw = process.env[name]
  if (!raw) return fallback
  const value = Number(raw)
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid ${name}: ${raw}`)
  }
  return value
}

// TC native-inbound min is ~$5-10, so default $15 keeps swaps above floor.
const MIN_SWAP_USD = readUsdEnv('SWAP_MIN_USD', 15)
const TARGET_SWAP_USD = readUsdEnv('SWAP_TARGET_USD', 15)

// Chain symbols. Covers all SwapKit-enabled chains (SDK 0.26+) plus the
// legacy native-swap chains. Used to parse vault balance text and map to
// the native token symbol shown in the swap UI.
export const CHAIN_SYMBOLS: Record<string, string> = {
  // SwapKit source chains
  ethereum: 'ETH',
  arbitrum: 'ETH',
  optimism: 'ETH',
  base: 'ETH',
  bsc: 'BNB',
  polygon: 'MATIC',
  avalanche: 'AVAX',
  solana: 'SOL',
  // SwapKit destination-only chains
  bitcoin: 'BTC',
  bitcoincash: 'BCH',
  cardano: 'ADA',
  cosmos: 'ATOM',
  dash: 'DASH',
  dogecoin: 'DOGE',
  kujira: 'KUJI',
  litecoin: 'LTC',
  mayachain: 'CACAO',
  ripple: 'XRP',
  sui: 'SUI',
  thorchain: 'RUNE',
  ton: 'TON',
  tron: 'TRX',
  zcash: 'ZEC',
}

// Chains available for swaps. Comma-separated env override drives both the
// dynamic-pair selector and the route-matrix test. Default = full SwapKit
// surface. Set SWAPPABLE_CHAINS=bitcoin,ethereum for the legacy smoke run.
const SWAPPABLE_CHAINS = (
  process.env.SWAPPABLE_CHAINS || Object.keys(CHAIN_SYMBOLS).join(',')
)
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(Boolean)

// Display names used in vault portfolio text. Falls back to titlecased chainId
// for the common single-word chains. Anything multi-word or non-standard goes here.
const CHAIN_DISPLAY_NAMES: Record<string, string> = {
  bitcoincash: 'Bitcoin[ -]?Cash',
  mayachain: 'MayaChain',
}

// Per-symbol fallback swap amounts (token units) when balance can't be parsed.
// Sized to ~$15 at mid-2026 prices; conservative but above TC inbound floor.
export const SYMBOL_FALLBACK_AMOUNTS: Record<string, string> = {
  ETH: '0.005',
  BTC: '0.00025',
  BNB: '0.025',
  MATIC: '20',
  AVAX: '0.4',
  SOL: '0.1',
  RUNE: '4',
  CACAO: '4',
  ATOM: '2',
  LTC: '0.15',
  DOGE: '60',
  BCH: '0.03',
  DASH: '0.6',
  ZEC: '0.6',
  KUJI: '20',
  ADA: '20',
  SUI: '5',
  TON: '3',
  TRX: '50',
  XRP: '7',
}

// Vault portfolio UI format: "Ethereum0x1a2...f334$40.2212 assets" or "Bitcoin bc1qj...rfea$0.000 BTC"
export async function getVaultBalances(page: Page): Promise<ChainBalance[]> {
  const balances: ChainBalance[] = []

  await page.waitForTimeout(2000)
  const pageText = (await page.locator('body').textContent()) || ''

  for (const [chainId, symbol] of Object.entries(CHAIN_SYMBOLS)) {
    if (!SWAPPABLE_CHAINS.includes(chainId)) continue

    // Multi-word chains (Bitcoin-Cash, MayaChain) need an explicit display-name override.
    const chainNamePattern =
      CHAIN_DISPLAY_NAMES[chainId] ||
      chainId.charAt(0).toUpperCase() + chainId.slice(1)
    const balanceMatch = pageText.match(
      new RegExp(`${chainNamePattern}[^$]*\\$(\\d+[,.]?\\d*\\.?\\d*)`, 'i')
    )
    if (!balanceMatch) continue

    const usdValue = parseFloat(balanceMatch[1].replace(',', ''))
    // Search within the matched chain row only to avoid cross-chain symbol collisions
    // (ethereum/arbitrum/optimism/base all share 'ETH'; searching pageText would reuse the first match).
    const tokenMatch = balanceMatch[0].match(
      new RegExp(`(\\d+\\.\\d+)\\s*${symbol}`, 'i')
    )
    const tokenBalance = tokenMatch ? parseFloat(tokenMatch[1]) : 0

    balances.push({
      chainId,
      symbol,
      balance: tokenBalance,
      balanceUsd: usdValue,
    })
    console.log(
      `  ${chainId}: $${usdValue.toFixed(2)} (${tokenBalance} ${symbol})`
    )
  }

  return balances
}

// Source = highest-balance chain above MIN_SWAP_USD; dest = lowest (self-balancing).
export function selectSwapPair(balances: ChainBalance[]): SwapConfig | null {
  const validSources = balances
    .filter(b => b.balanceUsd >= MIN_SWAP_USD)
    .sort((a, b) => b.balanceUsd - a.balanceUsd)

  if (validSources.length === 0) {
    console.log('❌ No chains have sufficient balance for swap')
    return null
  }

  const source = validSources[0]
  const destinations = balances
    .filter(b => b.chainId !== source.chainId)
    .sort((a, b) => a.balanceUsd - b.balanceUsd)

  if (destinations.length === 0) {
    console.log('❌ No destination chain available')
    return null
  }

  const dest = destinations[0]

  let amount: string
  if (source.balance > 0 && source.balanceUsd > 0) {
    const pricePerToken = source.balanceUsd / source.balance
    const tokensNeeded = TARGET_SWAP_USD / pricePerToken
    amount = tokensNeeded.toFixed(source.symbol === 'BTC' ? 8 : 6)
  } else {
    // Per-symbol fallback sized to ~TARGET_SWAP_USD; '0.001' covers unknown symbols.
    amount = SYMBOL_FALLBACK_AMOUNTS[source.symbol] || '0.001'
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

export function canSwap(balances: ChainBalance[]): boolean {
  const validSources = balances.filter(b => b.balanceUsd >= MIN_SWAP_USD)
  return validSources.length > 0 && balances.length >= 2
}
