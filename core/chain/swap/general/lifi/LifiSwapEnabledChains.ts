import { Chain, EvmChain } from '@core/chain/Chain'
import { getEvmChainId } from '@core/chain/chains/evm/chainInfo'
import { hexToNumber } from '@lib/utils/hex/hexToNumber'
import { makeRecord } from '@lib/utils/record/makeRecord'
import { ChainId } from '@lifi/sdk'

export const lifiSwapEnabledChains = [
  ...Object.values(EvmChain),
  Chain.Solana,
] as const

export type LifiSwapEnabledChain = (typeof lifiSwapEnabledChains)[number]

export const lifiSwapChainId: Record<LifiSwapEnabledChain, ChainId> = {
  ...makeRecord(Object.values(EvmChain), chain =>
    hexToNumber(getEvmChainId(chain))
  ),
  [Chain.Solana]: ChainId.SOL,
}
