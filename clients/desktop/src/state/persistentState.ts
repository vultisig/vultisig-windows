import { createPersistentStateHook } from '../lib/ui/state/createPersistentStateHook';
import { createPersistentStateManager } from '../lib/ui/state/createPersistentStateManager';
import { LocalStorage } from '../lib/ui/state/LocalStorage';
import { TemporaryStorage } from '../lib/ui/state/TemporaryStorage';

export enum PersistentStateKey {
  CurrentVaultId = 'currentVaultId',
  IsVaultBalanceVisible = 'isVaultBalanceVisible',
  ReactQueryState = 'reactQueryState',
  HasFinishedOnboarding = 'HasFinishedOnboarding',
  Language = 'language',
  FiatCurrency = 'fiatCurrency',
  AddressBook = 'addressBook',
  FavouriteTokens = 'favouriteTokens',
  DefaultChains = 'defaultChains',
  HasAutoDiscoveryBeenDoneForChain = 'HasAutoDiscoveryBeenDoneForChain',
  ChainAllTokens = 'ChainAllTokens',
}

const persistentStorage =
  typeof window !== 'undefined'
    ? new LocalStorage<PersistentStateKey>()
    : new TemporaryStorage<PersistentStateKey>();

export const usePersistentState =
  createPersistentStateHook<PersistentStateKey>(persistentStorage);

export const managePersistentState =
  createPersistentStateManager<PersistentStateKey>(persistentStorage);
