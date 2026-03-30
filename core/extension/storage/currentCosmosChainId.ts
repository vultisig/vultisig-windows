import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'
import { Chain } from '@vultisig/core-chain/Chain'
import { getCosmosChainId } from '@vultisig/core-chain/chains/cosmos/chainInfo'

type GetCurrentCosmosChainIdFunction = () => Promise<string>
type SetCurrentCosmosChainIdFunction = (chainId: string) => Promise<void>

const initialCosmosChainId = getCosmosChainId(Chain.Cosmos)

const currentCosmosChainIdStorageKey = 'currentCosmosChainId'

export const getCurrentCosmosChainId: GetCurrentCosmosChainIdFunction = () =>
  getStorageValue(currentCosmosChainIdStorageKey, initialCosmosChainId)

export const setCurrentCosmosChainId: SetCurrentCosmosChainIdFunction = async (
  chainId: string
) => {
  await setStorageValue(currentCosmosChainIdStorageKey, chainId)
}
