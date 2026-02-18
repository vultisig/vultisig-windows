import { ChildrenProp } from '@lib/ui/props'
import { setupValueProvider } from '@lib/ui/state/setupValueProvider'
import { useMemo } from 'react'

import { useCore } from '../../state/core'
import { generateMpcServiceName } from '../utils/generateMpcServiceName'

export const [MpcServiceNameProvider, useMpcServiceName] =
  setupValueProvider<string>('MpcServiceName')

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
