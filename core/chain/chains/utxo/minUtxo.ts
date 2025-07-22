import { Chain, UtxoBasedChain } from '../../Chain'

export const minUtxo: Record<UtxoBasedChain, bigint> = {
  [Chain.Cardano]: 1_400_000n,
  [Chain.Bitcoin]: 546n,
  [Chain.Dogecoin]: 1_000_000n,
  [Chain.Litecoin]: 1_000n,
  [Chain.BitcoinCash]: 1_000n,
  [Chain.Dash]: 1_000n,
  [Chain.Zcash]: 1_000n,
}
