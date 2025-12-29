import { Chain } from '@core/chain/Chain'
import { getChainKind, isChainOfKind } from '@core/chain/ChainKind'

export type AddressBookChainType =
  | { kind: 'evm' }
  | { kind: 'chain'; chain: Chain }

export const toAddressBookChainType = (chain: Chain): AddressBookChainType => {
  if (isChainOfKind(chain, 'evm')) {
    return { kind: 'evm' }
  }
  return { kind: 'chain', chain }
}

export const fromAddressBookChainType = (
  chainType: AddressBookChainType
): Chain => {
  if (chainType.kind === 'evm') {
    return Chain.Ethereum
  }
  return chainType.chain
}

export const isEvmChain = (chain: Chain): boolean =>
  getChainKind(chain) === 'evm'

export const getAddressBookChainOptions = (): AddressBookChainType[] => {
  const nonEvmChains = Object.values(Chain).filter(chain => !isEvmChain(chain))
  return [
    { kind: 'evm' },
    ...nonEvmChains.map(chain => ({ kind: 'chain' as const, chain })),
  ]
}
