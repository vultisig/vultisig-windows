import { Coin } from '../../../lib/types/coin';
import { getStateProviderSetup } from '../../../lib/ui/state/getStateProviderSetup';

export const { useState: useCoinTo, provider: CoinToProvider } =
  getStateProviderSetup<Coin | null>('CoinTo');
