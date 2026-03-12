/**
 * Vault Address Helper
 *
 * Reads vault coin addresses from chrome.storage.local after vault import.
 * This avoids unreliable UI scraping for address extraction.
 */

import type { BrowserContext } from '@playwright/test'
import { readChromeStorage, readAllChromeStorage } from './chrome-storage'

/**
 * Coin record from chrome storage
 */
interface StoredCoin {
  chain: string
  id: string
  address: string
  ticker?: string
  decimals?: number
  [key: string]: unknown
}

/**
 * Read all vault addresses from chrome storage.
 *
 * Returns a map of chain -> address for the current vault.
 */
export async function getVaultAddresses(
  context: BrowserContext
): Promise<Record<string, string>> {
  try {
    // Get current vault ID
    const currentVaultId = await readChromeStorage<string>(context, 'currentVaultId')
    if (!currentVaultId) {
      console.log('⚠️ No currentVaultId in storage')
      return {}
    }

    // Get coins for vault
    const vaultsCoins = await readChromeStorage<Record<string, StoredCoin[]>>(context, 'vaultsCoins')
    if (!vaultsCoins) {
      console.log('⚠️ No vaultsCoins in storage')
      // Try reading all storage to debug
      const allStorage = await readAllChromeStorage(context)
      console.log('Storage keys:', Object.keys(allStorage))
      return {}
    }

    const coins = vaultsCoins[currentVaultId]
    if (!coins || coins.length === 0) {
      console.log(`⚠️ No coins for vault ${currentVaultId}`)
      console.log('Available vault IDs:', Object.keys(vaultsCoins))
      return {}
    }

    // Build chain -> address map (use first coin per chain for native address)
    const addresses: Record<string, string> = {}
    for (const coin of coins) {
      if (coin.chain && coin.address && !addresses[coin.chain.toLowerCase()]) {
        addresses[coin.chain.toLowerCase()] = coin.address
      }
    }

    console.log(`✅ Found addresses for ${Object.keys(addresses).length} chains`)
    return addresses
  } catch (error) {
    console.error('Failed to read vault addresses:', error)
    return {}
  }
}

/**
 * Get address for a specific chain symbol.
 * Maps common symbols (ETH, BTC, SOL, etc.) to chain names.
 */
export async function getAddressForChain(
  context: BrowserContext,
  chainSymbol: string
): Promise<string | null> {
  const addresses = await getVaultAddresses(context)

  // Try direct match first
  const symbolLower = chainSymbol.toLowerCase()
  if (addresses[symbolLower]) {
    return addresses[symbolLower]
  }

  // Map symbols to chain names
  const symbolToChain: Record<string, string[]> = {
    eth: ['ethereum'],
    btc: ['bitcoin'],
    bnb: ['bsc', 'bscchain', 'binancesmartchain'],
    sol: ['solana'],
    rune: ['thorchain'],
    atom: ['cosmos'],
    matic: ['polygon'],
    avax: ['avalanche'],
    ltc: ['litecoin'],
    doge: ['dogecoin'],
  }

  const possibleChains = symbolToChain[symbolLower] || []
  for (const chainName of possibleChains) {
    if (addresses[chainName]) {
      return addresses[chainName]
    }
  }

  // Try partial match
  for (const [chain, addr] of Object.entries(addresses)) {
    if (chain.includes(symbolLower) || symbolLower.includes(chain)) {
      return addr
    }
  }

  console.log(`⚠️ No address found for ${chainSymbol}. Available:`, Object.keys(addresses))
  return null
}
