import { EvmChain } from '@vultisig/core-chain/Chain'

type KnownEvmContractEntry = {
  label: string
}

const canonicalAddressKey = (address: string): string => {
  const trimmed = address.trim()
  if (trimmed.startsWith('0x') || trimmed.startsWith('0X')) {
    return `0x${trimmed.slice(2).toLowerCase()}`
  }
  return trimmed.toLowerCase()
}

const registry: Partial<
  Record<EvmChain, Record<string, KnownEvmContractEntry>>
> = {
  [EvmChain.Ethereum]: {
    [canonicalAddressKey('0x7a250d5630b4cf539739df2c5dacb4c659f2488d')]: {
      label: 'Uniswap V2 Router',
    },
  },
}

type LookupKnownEvmContractInput = {
  address: string
  chain: EvmChain
}

/**
 * Returns registry metadata for a known protocol/router contract on `chain`,
 * or `null` when the address is unknown.
 */
export const lookupKnownEvmContract = ({
  address,
  chain,
}: LookupKnownEvmContractInput): KnownEvmContractEntry | null => {
  const chainEntries = registry[chain]
  if (!chainEntries) {
    return null
  }
  return chainEntries[canonicalAddressKey(address)] ?? null
}
