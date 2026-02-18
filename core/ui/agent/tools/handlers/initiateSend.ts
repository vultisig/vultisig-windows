import {
  convertToSmallestUnit,
  looksLikeAddress,
  parseCoinInput,
  resolveDecimalsByChainAndToken,
  truncateAddress,
} from '../shared/assetResolution'
import type { CoinInfo, ToolHandler } from '../types'

function findCoinInVault(
  coins: CoinInfo[],
  chain: string,
  contractAddress?: string
): CoinInfo | undefined {
  return coins.find(c => {
    if (c.chain.toLowerCase() !== chain.toLowerCase()) return false
    if (contractAddress) {
      return c.contractAddress?.toLowerCase() === contractAddress.toLowerCase()
    }
    return c.isNativeToken
  })
}

function findCoinByTicker(
  coins: CoinInfo[],
  ticker: string
): CoinInfo | undefined {
  const upper = ticker.toUpperCase()
  return coins.find(c => c.ticker.toUpperCase() === upper)
}

export const handleInitiateSend: ToolHandler = async (input, context) => {
  if (input.address != null) {
    const addr = String(input.address).trim()
    if (addr && !looksLikeAddress(addr)) {
      throw new Error(
        `"${addr}" does not look like a valid blockchain address. If this is a vault name or contact, please look up the actual address first`
      )
    }
  }

  const navState: Record<string, unknown> = {}

  if (input.coin != null) {
    const coinStr = String(input.coin).trim()
    const ticker = coinStr.split('-')[0].toUpperCase()
    const parsed = parseCoinInput(coinStr)

    let resolvedCoin: Record<string, string> | null = null

    if (parsed && context.coins.length > 0) {
      const vaultMatch = findCoinInVault(context.coins, parsed.chain, parsed.id)
      if (vaultMatch) {
        resolvedCoin = { chain: vaultMatch.chain }
        if (vaultMatch.contractAddress) {
          resolvedCoin.id = vaultMatch.contractAddress
        }
      } else {
        const tickerMatch = findCoinByTicker(context.coins, ticker)
        if (tickerMatch) {
          resolvedCoin = { chain: tickerMatch.chain }
          if (tickerMatch.contractAddress) {
            resolvedCoin.id = tickerMatch.contractAddress
          }
        }
      }
    } else if (parsed) {
      resolvedCoin = parsed
    }

    if (!resolvedCoin && context.coins.length > 0) {
      return {
        data: {
          success: false,
          error: `${ticker} is not tracked in your vault. Add it first with add_coin.`,
        },
      }
    }

    if (resolvedCoin) {
      navState.coin = resolvedCoin
    }
  }

  if (input.address != null) {
    navState.address = String(input.address)
  }

  if (input.amount != null) {
    let amountStr = String(input.amount).trim()
    if (amountStr) {
      const coinMap = navState.coin as Record<string, string> | undefined
      if (coinMap) {
        const chain = coinMap.chain ?? ''
        const tokenAddr = coinMap.id ?? ''
        const decimals = resolveDecimalsByChainAndToken(chain, tokenAddr)
        amountStr = convertToSmallestUnit(amountStr, decimals)
      }
      navState.amount = amountStr
    }
  }

  if (input.memo != null) {
    navState.memo = String(input.memo)
  }

  let result = 'Opening send interface'
  if (input.coin != null) {
    if (input.address != null) {
      const addrStr = String(input.address)
      if (input.amount != null) {
        result = `Opening send: ${input.amount} ${input.coin} to ${truncateAddress(addrStr)}`
      } else {
        result = `Opening send: ${input.coin} to ${truncateAddress(addrStr)}`
      }
    } else {
      result = `Opening send for ${input.coin}`
    }
  }

  return {
    data: {
      success: true,
      message:
        result + '. Please review and sign the transaction in the send screen.',
      navigation: { id: 'send', state: navState },
      ui: {
        title: 'Send Ready',
        summary: result,
        actions: [
          {
            type: 'navigate',
            label: 'Open Send',
            navigation: { id: 'send', state: navState },
          },
        ],
      },
    },
  }
}
