import { Chain } from '@vultisig/core-chain/Chain'

import { isEvmChain } from '../../address-book/AddressBookChainType'

type VaultAddressCandidate = {
  name: string
  coins: readonly {
    chain: Chain
    address: string
  }[]
}

type AddressOnChain = {
  address: string
  chain: Chain
}

type GetVaultNameForAddressInput<T extends VaultAddressCandidate> = {
  address: string
  chain: Chain
  vaults: readonly T[]
  deriveAddress: (vault: T) => string | null
}

const normalizeAddress = ({ address, chain }: AddressOnChain) =>
  isEvmChain(chain) ? address.toLowerCase() : address

/**
 * Resolves a vault name from its enabled coins, then falls back to deriving the
 * requested chain address for vaults where that coin is not enabled locally.
 */
export const getVaultNameForAddress = <T extends VaultAddressCandidate>({
  address,
  chain,
  vaults,
  deriveAddress,
}: GetVaultNameForAddressInput<T>): string | null => {
  const normalizedAddress = normalizeAddress({ address, chain })

  const enabledCoinMatch = vaults.find(vault =>
    vault.coins.some(
      coin =>
        (isEvmChain(chain) ? isEvmChain(coin.chain) : coin.chain === chain) &&
        normalizeAddress({ address: coin.address, chain }) === normalizedAddress
    )
  )

  if (enabledCoinMatch) return enabledCoinMatch.name

  return (
    vaults.find(vault => {
      const derivedAddress = deriveAddress(vault)

      return (
        derivedAddress !== null &&
        normalizeAddress({ address: derivedAddress, chain }) ===
          normalizedAddress
      )
    })?.name ?? null
  )
}
