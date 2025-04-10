import { ChildrenProp } from '@lib/ui/props'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { useMemo } from 'react'

import { generateLocalPartyId } from '..'

export const {
  useValue: useMpcLocalPartyId,
  provider: MpcLocalPartyIdProvider,
} = getValueProviderSetup<string>('MpcLocalPartyId')

export const GeneratedMpcLocalPartyIdProvider = ({
  children,
}: ChildrenProp) => {
  const MpcLocalPartyId = useMemo(generateLocalPartyId, [])

  return (
    <MpcLocalPartyIdProvider value={MpcLocalPartyId}>
      {children}
    </MpcLocalPartyIdProvider>
  )
}
