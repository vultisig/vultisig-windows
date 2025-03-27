import { ChildrenProp } from '@lib/ui/props'
import { toEntries } from '@lib/utils/record/toEntries'
import { useMemo } from 'react'

import { getStateProviderSetup } from '../../../lib/ui/state/getStateProviderSetup'
import { MpcPeersProvider } from './mpcPeers'

const {
  useState: useMpcPeersSelectionRecord,
  provider: MpcPeersSelectionRecordProvider,
} = getStateProviderSetup<Record<string, boolean>>('MpcPeersSelectionRecord')

const MpcPeersBasedOnSelectionRecord = ({ children }: ChildrenProp) => {
  const [record] = useMpcPeersSelectionRecord()

  const value = useMemo(
    () =>
      toEntries(record)
        .filter(({ value }) => value)
        .map(({ key }) => key),
    [record]
  )

  return <MpcPeersProvider value={value}>{children}</MpcPeersProvider>
}

export const MpcPeersSelectionProvider = ({ children }: ChildrenProp) => {
  return (
    <MpcPeersSelectionRecordProvider initialValue={{}}>
      <MpcPeersBasedOnSelectionRecord>
        {children}
      </MpcPeersBasedOnSelectionRecord>
    </MpcPeersSelectionRecordProvider>
  )
}

export { useMpcPeersSelectionRecord }
