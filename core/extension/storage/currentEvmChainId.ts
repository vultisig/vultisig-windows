import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'
import { Chain } from '@vultisig/core-chain/Chain'
import { getEvmChainId } from '@vultisig/core-chain/chains/evm/chainInfo'

type GetCurrentEVMChainIdFunction = () => Promise<string>

type SetCurrentEVMChainIdFunction = (chainId: string) => Promise<void>

const initialEVMChainID = getEvmChainId(Chain.Ethereum)

const currentEVMChainIdStorageKey = 'currentEVMChainId'

export const getCurrentEVMChainId: GetCurrentEVMChainIdFunction = () =>
  getStorageValue(currentEVMChainIdStorageKey, initialEVMChainID)

export const setCurrentEVMChainId: SetCurrentEVMChainIdFunction = async (
  chainId: string
) => {
  await setStorageValue(currentEVMChainIdStorageKey, chainId)
}
