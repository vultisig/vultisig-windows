import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Chain } from '@vultisig/core-chain/Chain'

/**
 * The current vault's QBTC bech32 address (the governance voter), or
 * `undefined` if the vault hasn't derived QBTC yet.
 */
export const useQbtcVoterAddress = (): string | undefined => {
  const vaultCoins = useCurrentVaultCoins()
  return vaultCoins.find(coin => coin.chain === Chain.QBTC)?.address
}
