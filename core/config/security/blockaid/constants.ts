import { rootApiUrl } from '@core/config'

import { match } from '../../../../lib/utils/match'
import { Chain } from '../../../chain/Chain'

const blockaid_base = `${rootApiUrl}/blockaid/v0`

const getChainType = (chain: string) => {
  const chainLower = chain.toLowerCase()

  // Create a mapping of patterns to chain types
  const chainTypeMap = {
    solana: ['solana', 'mainnet'],
    sui: ['sui'],
    bitcoin: ['bitcoin'],
  } as const

  // Check each pattern and return the first match
  for (const [chainType, patterns] of Object.entries(chainTypeMap)) {
    if (patterns.some(pattern => chainLower.includes(pattern))) {
      return chainType as 'solana' | 'sui' | 'bitcoin'
    }
  }

  return 'evm' as const
}

export const Endpoints = {
  txScan: (chain: Chain) => {
    const chainType = getChainType(chain)

    return match(chainType, {
      solana: () => `${blockaid_base}/solana/message/scan`,
      sui: () => `${blockaid_base}/sui/transaction/scan`,
      bitcoin: () => `${blockaid_base}/bitcoin/transaction-raw/scan`,
      evm: () => `${blockaid_base}/evm/transaction-raw/scan`,
    })
  },
  rawTxScan: (chain: string) => {
    const chainType = getChainType(chain)

    return match(chainType, {
      bitcoin: () => `${blockaid_base}/bitcoin/transaction-raw/scan`,
      evm: () => `${blockaid_base}/evm/transaction-raw/scan`,
      solana: () => `${blockaid_base}/evm/transaction-raw/scan`, // fallback to EVM
      sui: () => `${blockaid_base}/evm/transaction-raw/scan`, // fallback to EVM
    })
  },
  addressScan: (chain: string) => {
    const chainType = getChainType(chain)

    return match(chainType, {
      solana: () => `${blockaid_base}/solana/address/scan`,
      sui: () => `${blockaid_base}/sui/address/scan`,
      bitcoin: () => `${blockaid_base}/bitcoin/address/scan`,
      evm: () => `${blockaid_base}/evm/address/scan`,
    })
  },
}

export const BlockaidResultTypes = {
  Benign: 'Benign',
  Warning: 'Warning',
  Malicious: 'Malicious',
} as const
