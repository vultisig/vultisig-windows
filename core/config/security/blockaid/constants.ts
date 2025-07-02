import { rootApiUrl } from '@core/config'

const blockaid_base = `${rootApiUrl}/blockaid/v0`

export const Endpoints = {
  txScan: (chain: string) => {
    const chainLower = chain.toLowerCase()
    if (chainLower.includes('solana')) {
      return `${blockaid_base}/solana/message/scan`
    } else if (chainLower.includes('sui')) {
      return `${blockaid_base}/sui/transaction/scan`
    } else if (chainLower.includes('bitcoin')) {
      return `${blockaid_base}/bitcoin/transaction-raw/scan`
    } else {
      // Default to EVM for all other chains
      return `${blockaid_base}/evm/transaction-raw/scan`
    }
  },
  rawTxScan: (chain: string) => {
    const chainLower = chain.toLowerCase()
    if (chainLower.includes('bitcoin')) {
      return `${blockaid_base}/bitcoin/transaction-raw/scan`
    } else {
      return `${blockaid_base}/evm/transaction-raw/scan`
    }
  },
  addressScan: (chain: string) => {
    const chainLower = chain.toLowerCase()
    if (chainLower.includes('solana')) {
      return `${blockaid_base}/solana/address/scan`
    } else if (chainLower.includes('sui')) {
      return `${blockaid_base}/sui/address/scan`
    } else if (chainLower.includes('bitcoin')) {
      return `${blockaid_base}/bitcoin/address/scan`
    } else {
      // Default to EVM for all other chains
      return `${blockaid_base}/evm/address/scan`
    }
  },
  tokenScan: `${blockaid_base}/token/scan`,
}
