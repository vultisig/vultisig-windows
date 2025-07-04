import { Chain } from '../../../chain/Chain'
import { ChainKind, getChainKind } from '../../../chain/ChainKind'

type BlockaidScanPayload = Record<string, any>

type BuildBlockaidScanPayloadInput = {
  chain: Chain | string
  accountAddress?: string
  rawTx?: string
  metadata?: any
}

export const buildBlockaidScanPayload = ({
  chain,
  accountAddress,
  rawTx,
  metadata,
}: BuildBlockaidScanPayloadInput): BlockaidScanPayload => {
  const kind = getChainKind(chain as Chain) as ChainKind
  // Remove 0x prefix if present for solana
  let tx = rawTx ?? ''
  if (tx.startsWith('0x')) {
    tx = tx.slice(2)
  }
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
        chain: 'mainnet',
        account_address: accountAddress,
        metadata,
        transactions: [tx],
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
