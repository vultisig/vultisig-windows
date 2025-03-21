import { ChildrenProp } from '@lib/ui/props'
import { useMemo } from 'react'

import { getValueProviderSetup } from '../../../lib/ui/state/getValueProviderSetup'
import { generateHexEncryptionKey } from '../../keygen/utils/generateHexEncryptionKey'

export const {
  useValue: useCurrentHexEncryptionKey,
  provider: CurrentHexEncryptionKeyProvider,
} = getValueProviderSetup<string>('CurrentHexEncryptionKey')

export const GeneratedHexEncryptionKeyProvider = ({
  children,
}: ChildrenProp) => {
  const HexEncryptionKey = useMemo(generateHexEncryptionKey, [])

  return (
    <CurrentHexEncryptionKeyProvider value={HexEncryptionKey}>
      {children}
    </CurrentHexEncryptionKeyProvider>
  )
}
