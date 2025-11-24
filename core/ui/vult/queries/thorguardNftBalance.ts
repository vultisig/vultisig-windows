import { Chain, EvmChain } from '@core/chain/Chain'
import { useErc721BalanceQuery } from '@core/ui/chain/evm/queries/erc721Balance'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { Address } from 'viem'

const thorguardNftAddress =
  '0xa98b29a8f5a247802149c268ecf860b8308b7291' as Address

export const useThorguardNftBalanceQuery = () => {
  const address = useCurrentVaultAddress(Chain.Ethereum)

  return useErc721BalanceQuery({
    chain: EvmChain.Ethereum,
    address: thorguardNftAddress,
    accountAddress: address as Address,
  })
}
