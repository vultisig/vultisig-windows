import { useMemo } from 'react';

import { getStateProviderSetup } from '../../../../lib/ui/state/getStateProviderSetup';
import { toEntries } from '@lib/utils/record/toEntries';

export const {
  useState: usePeersSelectionRecord,
  provider: PeersSelectionRecordProvider,
} = getStateProviderSetup<Record<string, boolean>>('PeersSelectionRecord');

export const useSelectedPeers = () => {
  const [value] = usePeersSelectionRecord();

  return useMemo(
    () =>
      toEntries(value)
        .filter(({ value }) => value)
        .map(({ key }) => key),
    [value]
  );
};
