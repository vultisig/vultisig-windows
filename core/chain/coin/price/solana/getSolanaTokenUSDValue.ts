import { Coin } from '@core/chain/coin/Coin'
import { defaultFiatCurrency, FiatCurrency } from '@core/config/FiatCurrency'

import { OtherChain } from '../../../Chain'
import { coinKeyToString } from '../../Coin'

const SOLANA_USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

type Input = {
  coins: Pick<Coin, 'id' | 'chain' | 'priceProviderId'>[] // Ensure it's an array of objects with `id`
  fiatCurrency?: FiatCurrency
  chain: OtherChain.Solana // Explicitly defining the chain as Solana
}

const generateSolanaTokenQuoteUrl = (
  inputMint: string,
  outputMint: string,
  amount: string,
  slippageBps: string
): string => {
  return `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`
}

export const getSolanaTokenPrices = async ({
  coins,
  _fiatCurrency = defaultFiatCurrency,
}: Input): Promise<Record<string, number>> => {
  const result: Record<string, number> = {}
  const amountDecimal = 1_000_000 // 1 USDC

  try {
    //"https://quote-api.jup.ag/v6/quote?inputMint=\(inputMint)&outputMint=\(outputMint)&amount=\(amount)&slippageBps=\(slippageBps)"
    // Process each request sequentially to avoid rate limits
    for (const coin of coins.filter(coin => coin.id !== 'SOL')) {
      const url = generateSolanaTokenQuoteUrl(
        coin.id,
        SOLANA_USDC_MINT,
        amountDecimal.toString(),
        '50'
      )

      try {
        const response = await fetch(url)
        if (!response.ok) {
          console.error(`Failed to fetch price for ${coin.id}`)
          result[coinKeyToString(coin)] = 0.0
          continue // Skip to the next coin
        }

        const data = await response.json()
        const price = parseFloat(data?.swapUsdValue ?? '0')

        result[coinKeyToString(coin)] = price
      } catch (fetchError) {
        console.error(`Error fetching price for ${coin.id}:`, fetchError)
        result[coinKeyToString(coin)] = 0.0
      }
    }
  } catch (error) {
    console.error('Error in getSolanaTokenPrices:', error)
  }

  return result
}
