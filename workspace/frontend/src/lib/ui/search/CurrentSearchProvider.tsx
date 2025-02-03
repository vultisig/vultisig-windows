import { getStateProviderSetup } from '../state/getStateProviderSetup';

export const { useState: useCurrentSearch, provider: CurrentSearchProvider } =
  getStateProviderSetup<string>('CurrentSearch');
