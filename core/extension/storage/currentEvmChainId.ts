import { Chain } from '@core/chain/Chain'
import { getEvmChainId } from '@core/chain/chains/evm/chainInfo'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

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
