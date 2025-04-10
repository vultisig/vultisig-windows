import { ChildrenProp } from '@lib/ui/props'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { useMemo } from 'react'

import { generateHexChainCode } from '../../keygen/utils/generateHexChainCode'

export const {
  useValue: useCurrentHexChainCode,
  provider: CurrentHexChainCodeProvider,
} = getValueProviderSetup<string>('CurrentHexChainCode')

export const GeneratedHexChainCodeProvider = ({ children }: ChildrenProp) => {
  const HexChainCode = useMemo(generateHexChainCode, [])

  return (
    <CurrentHexChainCodeProvider value={HexChainCode}>
      {children}
    </CurrentHexChainCodeProvider>
  )
}
