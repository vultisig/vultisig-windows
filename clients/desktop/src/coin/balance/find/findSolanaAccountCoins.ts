import { ChainAccount } from '../../../chain/ChainAccount';
import { RpcServiceSolana } from '../../../services/Rpc/solana/RpcServiceSolana';

export const findSolanaAccountCoins = async (account: ChainAccount) => {
  const service = new RpcServiceSolana();
  return service.getTokens(account);
};
