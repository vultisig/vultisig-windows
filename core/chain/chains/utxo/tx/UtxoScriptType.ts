import { UtxoChain } from '@core/chain/Chain'

type UtxoScriptType = 'wpkh' | 'pkh'

export const utxoChainScriptType: Record<UtxoChain, UtxoScriptType> = {
  [UtxoChain.Bitcoin]: 'wpkh',
  [UtxoChain.Litecoin]: 'wpkh',
  [UtxoChain.BitcoinCash]: 'pkh',
  [UtxoChain.Dogecoin]: 'pkh',
  [UtxoChain.Dash]: 'pkh',
}
