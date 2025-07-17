import { Chain } from '@core/chain/Chain'
import { getEvmChainId } from '@core/chain/chains/evm/chainInfo'
import { getPersistentState } from '@lib/ui/state/persistent/getPersistentState'
import { setPersistentState } from '@lib/ui/state/persistent/setPersistentState'

type GetCurrentEVMChainIdFunction = () => Promise<string>

type SetCurrentEVMChainIdFunction = (chainId: string) => Promise<void>

const initialEVMChainID = getEvmChainId(Chain.Ethereum)

const currentEVMChainIdStorageKey = 'currentEVMChainId'

export const getCurrentEVMChainId: GetCurrentEVMChainIdFunction = () =>
  getPersistentState(currentEVMChainIdStorageKey, initialEVMChainID)

export const setCurrentEVMChainId: SetCurrentEVMChainIdFunction = async (
  chainId: string
) => {
  await setPersistentState(currentEVMChainIdStorageKey, chainId)
}
