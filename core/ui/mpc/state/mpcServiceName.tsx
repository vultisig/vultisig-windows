import { ChildrenProp } from '@lib/ui/props'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { useMemo } from 'react'

import { generateMpcServiceName } from '../utils/generateMpcServiceName'
import { useMpcDevice } from './mpcDevice'

export const { useValue: useMpcServiceName, provider: MpcServiceNameProvider } =
  getValueProviderSetup<string>('MpcServiceName')

export const GeneratedMpcServiceNameProvider = ({ children }: ChildrenProp) => {
  const mpcDevice = useMpcDevice()
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
