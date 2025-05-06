import { ChildrenProp } from '@lib/ui/props'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { useMemo } from 'react'

import { useCore } from '../../state/core'
import { generateMpcServiceName } from '../utils/generateMpcServiceName'

export const { useValue: useMpcServiceName, provider: MpcServiceNameProvider } =
  getValueProviderSetup<string>('MpcServiceName')

export const GeneratedMpcServiceNameProvider = ({ children }: ChildrenProp) => {
  const { mpcDevice } = useCore()
  const serviceName = useMemo(
    () => generateMpcServiceName(mpcDevice),
    [mpcDevice]
  )

  return (
    <MpcServiceNameProvider value={serviceName}>
      {children}
    </MpcServiceNameProvider>
  )
}
