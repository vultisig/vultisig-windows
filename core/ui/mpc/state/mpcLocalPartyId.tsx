import { generateLocalPartyId } from '@core/mpc/devices/localPartyId'
import { ChildrenProp } from '@lib/ui/props'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { useMemo } from 'react'

import { useCore } from '../../state/core'
import { useCurrentVault } from '../../vault/state/currentVault'

export const {
  useValue: useMpcLocalPartyId,
  provider: MpcLocalPartyIdProvider,
} = getValueProviderSetup<string>('MpcLocalPartyId')

export const GeneratedMpcLocalPartyIdProvider = ({
  children,
}: ChildrenProp) => {
  const { mpcDevice } = useCore()
  const MpcLocalPartyId = useMemo(
    () => generateLocalPartyId(mpcDevice),
    [mpcDevice]
  )

  return (
    <MpcLocalPartyIdProvider value={MpcLocalPartyId}>
      {children}
    </MpcLocalPartyIdProvider>
  )
}

export const CurrentVaultLocalPartyIdProvider = ({
  children,
}: ChildrenProp) => {
  const { localPartyId } = useCurrentVault()

  return (
    <MpcLocalPartyIdProvider value={localPartyId}>
      {children}
    </MpcLocalPartyIdProvider>
  )
}
