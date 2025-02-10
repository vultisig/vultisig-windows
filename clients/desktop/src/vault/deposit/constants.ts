import { cosmosRpcUrl } from '../../chain/cosmos/cosmosRpcUrl';
import { CosmosChain } from '@core/chain/Chain';

export const MAYACHAIN_API_BASE_URL = `${cosmosRpcUrl[CosmosChain.MayaChain]}/mayachain`;
export const MAYACHAIN_POOLS_ENDPOINT = `${MAYACHAIN_API_BASE_URL}/pools`;
