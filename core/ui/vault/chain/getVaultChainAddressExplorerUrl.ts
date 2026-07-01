import { Chain } from '@vultisig/core-chain/Chain'
import { getBlockExplorerUrl } from '@vultisig/core-chain/utils/getBlockExplorerUrl'

type GetVaultChainAddressExplorerUrlInput = {
  address: string
  chain: Chain
}

const addressExplorerUrlByChain: Partial<
  Record<Chain, (address: string) => string>
> = {
  [Chain.TerraClassic]: address =>
    new URL(
      `/classic/address/${address}`,
      'https://finder.terra.money'
    ).toString(),
}

export const getVaultChainAddressExplorerUrl = ({
  address,
  chain,
}: GetVaultChainAddressExplorerUrlInput) => {
  const resolveAddressExplorerUrl = addressExplorerUrlByChain[chain]

  return resolveAddressExplorerUrl
    ? resolveAddressExplorerUrl(address)
    : getBlockExplorerUrl({ chain, entity: 'address', value: address })
}
