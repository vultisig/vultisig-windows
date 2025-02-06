import { memoize } from '@lib/utils/memoize';
import { createSolanaRpc } from '@solana/web3.js';

import { Endpoint } from '../../../services/Endpoint';

export const getSolanaClient = memoize(() => {
  return createSolanaRpc(Endpoint.solanaServiceRpc);
});
