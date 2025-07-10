import bs58 from 'bs58'

import { stripHexPrefix } from '../../../../lib/utils/hex/stripHexPrefix'
import { Chain } from '../../../chain/Chain'
import { ChainKind, getChainKind } from '../../../chain/ChainKind'
import { BlockaidScanPayload } from './types'

type BuildBlockaidScanPayloadInput = {
  chain: Chain | string
  accountAddress?: string
  rawTx?: string
  metadata?: Record<string, unknown>
}

export const buildBlockaidScanPayload = ({
  chain,
  accountAddress,
  rawTx,
  metadata,
}: BuildBlockaidScanPayloadInput): BlockaidScanPayload => {
  const kind = getChainKind(chain as Chain) as ChainKind
  // Remove 0x prefix if present for solana
  const tx = stripHexPrefix(rawTx ?? '')
  const base58Encoded = bs58.encode(Buffer.from(tx, 'hex'))
  switch (kind) {
    case 'evm':
      return {
        chain: chain.toString().toLowerCase(),
        account_address: accountAddress,
        data: rawTx,
        metadata,
      }
    case 'utxo':
      return {
        chain: chain.toString().toLowerCase(),
        address_account: accountAddress,
        transaction: rawTx,
        metadata,
      }
    case 'solana':
      return {
        encoding: 'base58',
        chain: 'mainnet',
        account_address: accountAddress,
        metadata,
        transactions: [base58Encoded],
      }
    case 'sui':
      return {
        chain: chain.toString().toLowerCase(),
        account_address: accountAddress,
        transaction: rawTx,
        metadata,
      }
    default:
      throw new Error(`Blockaid scan not supported for chain kind: ${kind}`)
  }
}
