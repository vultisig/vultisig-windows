import { createSolanaRpc } from '@solana/web3.js';

import { Endpoint } from '../../../services/Endpoint';

export const getSolanaRpcClient = () => {
  return createSolanaRpc(Endpoint.solanaServiceRpc);
};
