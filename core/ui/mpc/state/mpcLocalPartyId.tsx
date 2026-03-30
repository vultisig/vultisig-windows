import { ChildrenProp } from '@lib/ui/props'
import { setupValueProvider } from '@lib/ui/state/setupValueProvider'
import { generateLocalPartyId } from '@vultisig/core-mpc/devices/localPartyId'
import { useMemo } from 'react'

import { useCore } from '../../state/core'
import { useCurrentVault } from '../../vault/state/currentVault'

export const [MpcLocalPartyIdProvider, useMpcLocalPartyId] =
  setupValueProvider<string>('MpcLocalPartyId')

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
