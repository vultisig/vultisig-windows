import { Chain } from '../../model/chain';
import {
  PersistentStateKey,
  usePersistentState,
} from '../../state/persistentState';

const defaultChains = [
  Chain.Bitcoin,
  Chain.Ethereum,
  Chain.THORChain,
  Chain.Solana,
  Chain.BSC,
];

export const useDefaultChains = () => {
  return usePersistentState<Chain[]>(
    PersistentStateKey.DefaultChains,
    defaultChains
  );
};
