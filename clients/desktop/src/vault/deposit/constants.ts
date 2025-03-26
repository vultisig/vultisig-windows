import { CosmosChain } from '@core/chain/Chain'
import { cosmosRpcUrl } from '@core/chain/chains/cosmos/cosmosRpcUrl'

const MAYACHAIN_API_BASE_URL = `${cosmosRpcUrl[CosmosChain.MayaChain]}/mayachain`
export const MAYACHAIN_POOLS_ENDPOINT = `${MAYACHAIN_API_BASE_URL}/pools`
