import { rootApiUrl } from '@core/config'

import { match } from '../../../../lib/utils/match'
import { Chain } from '../../../chain/Chain'
import { getChainKind } from '../../../chain/ChainKind'

const blockaid_base = `${rootApiUrl}/blockaid/v0`

const getChainType = (chain: Chain | string) => {
  // Use established chain utilities for better consistency
  if (typeof chain === 'string') {
    const chainLower = chain.toLowerCase()

    // Create a mapping of patterns to chain types
    const chainTypeMap = {
      solana: ['solana'],
      sui: ['sui'],
      bitcoin: ['bitcoin'],
    } as const

    // Check each pattern and return the first match
    for (const [chainType, patterns] of Object.entries(chainTypeMap)) {
      if (patterns.some(pattern => chainLower.includes(pattern))) {
        return chainType as 'solana' | 'sui' | 'bitcoin'
      }
    }
  } else {
    // Use established chain kind utilities
    const kind = getChainKind(chain)
    return match(kind, {
      evm: () => 'evm' as const,
      solana: () => 'solana' as const,
      sui: () => 'sui' as const,
      utxo: () => 'bitcoin' as const,
    })
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
      evm: () => `${blockaid_base}/evm/json-rpc/scan`,
    })
  },
  rawTxScan: (chain: Chain) => {
    const chainType = getChainType(chain)

    return match(chainType, {
      bitcoin: () => `${blockaid_base}/bitcoin/transaction-raw/scan`,
      evm: () => `${blockaid_base}/evm/transaction-raw/scan`,
      solana: () => `${blockaid_base}/solana/transaction-raw/scan`,
      sui: () => `${blockaid_base}/sui/transaction-raw/scan`,
    })
  },
  addressScan: (chain: Chain) => {
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

export const BlockaidErrorTypes = {
  Warning: 'blockaid-warning',
  Malicious: 'blockaid-malicious',
} as const
