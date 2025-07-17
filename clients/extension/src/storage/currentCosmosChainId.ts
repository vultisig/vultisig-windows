import { Chain } from '@core/chain/Chain'
import { getCosmosChainId } from '@core/chain/chains/cosmos/chainInfo'
import { getPersistentState } from '@lib/ui/state/persistent/getPersistentState'
import { setPersistentState } from '@lib/ui/state/persistent/setPersistentState'

type GetCurrentCosmosChainIdFunction = () => Promise<string>
type SetCurrentCosmosChainIdFunction = (chainId: string) => Promise<void>

const initialCosmosChainId = getCosmosChainId(Chain.Cosmos)

const currentCosmosChainIdStorageKey = 'currentCosmosChainId'

export const getCurrentCosmosChainId: GetCurrentCosmosChainIdFunction = () =>
  getPersistentState(currentCosmosChainIdStorageKey, initialCosmosChainId)

export const setCurrentCosmosChainId: SetCurrentCosmosChainIdFunction = async (
  chainId: string
) => {
  await setPersistentState(currentCosmosChainIdStorageKey, chainId)
}
