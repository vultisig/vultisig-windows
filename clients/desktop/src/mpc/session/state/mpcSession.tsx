import { ChildrenProp } from '@lib/ui/props'
import { useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { getValueProviderSetup } from '../../../lib/ui/state/getValueProviderSetup'

export const { useValue: useMpcSessionId, provider: MpcSessionIdProvider } =
  getValueProviderSetup<string>('MpcSessionId')

export const GeneratedMpcSessionIdProvider = ({ children }: ChildrenProp) => {
  const MpcSessionId = useMemo(() => uuidv4(), [])

  return (
    <MpcSessionIdProvider value={MpcSessionId}>{children}</MpcSessionIdProvider>
  )
}
