import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useQuery } from '@tanstack/react-query'
import { Chain, EvmChain } from '@vultisig/core-chain/Chain'
import { getErc721Balance } from '@vultisig/core-chain/chains/evm/erc721/getErc721Balance'
import { getCoinBalance } from '@vultisig/core-chain/coin/balance'
import { vult } from '@vultisig/core-chain/coin/knownTokens'
import { getVultDiscountTier } from '@vultisig/core-chain/swap/affiliate'
import { Address } from 'viem'

const thorguardNftAddress: Address =
  '0xa98b29a8f5a247802149c268ecf860b8308b7291'

export const vultDiscountTierStaleTime = 5 * 60 * 1000

/** Shared cache key for an address's discount tier, so per-vault and active-vault lookups dedupe. */
export const vultDiscountTierQueryKey = (address: string) => [
  'vultDiscountTier',
  address,
]

/** Resolves the VULT discount tier for an Ethereum address (VULT balance + Thorguard NFT). */
export const fetchVultDiscountTier = async (address: string) => {
  const [vultBalance, thorguardNftBalance] = await Promise.all([
    getCoinBalance({ chain: vult.chain, id: vult.id, address }),
    getErc721Balance({
      chain: EvmChain.Ethereum,
      address: thorguardNftAddress,
      accountAddress: address as Address,
    }),
  ])
  return getVultDiscountTier({ vultBalance, thorguardNftBalance })
}

type UseVultDiscountTierQueryInput = {
  enabled?: boolean
}

export const useVultDiscountTierQuery = ({
  enabled = true,
}: UseVultDiscountTierQueryInput = {}) => {
  const address = useCurrentVaultAddress(Chain.Ethereum)

  return useQuery({
    queryKey: vultDiscountTierQueryKey(address),
    queryFn: () => fetchVultDiscountTier(address),
    enabled: enabled && !!address,
    placeholderData: null,
    staleTime: vultDiscountTierStaleTime,
  })
}
