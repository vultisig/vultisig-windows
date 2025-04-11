import { generateLocalPartyId } from '@core/mpc/devices/localPartyId'
import { useMpcDevice } from '@core/ui/mpc/state/mpcDevice'
import { ChildrenProp } from '@lib/ui/props'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { useMemo } from 'react'

import { useCurrentVault } from '../../vault/state/currentVault'

export const {
  useValue: useMpcLocalPartyId,
  provider: MpcLocalPartyIdProvider,
} = getValueProviderSetup<string>('MpcLocalPartyId')

export const GeneratedMpcLocalPartyIdProvider = ({
  children,
}: ChildrenProp) => {
  const mpcDevice = useMpcDevice()
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
