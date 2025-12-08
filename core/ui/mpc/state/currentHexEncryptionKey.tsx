import { generateHexEncryptionKey } from '@core/mpc/utils/generateHexEncryptionKey'
import { ChildrenProp } from '@lib/ui/props'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { useMemo } from 'react'

export const {
  useValue: useCurrentHexEncryptionKey,
  provider: CurrentHexEncryptionKeyProvider,
} = getValueProviderSetup<string>('CurrentHexEncryptionKey')

export const {
  useValue: useExternalEncryptionKey,
  provider: ExternalEncryptionKeyProvider,
} = getValueProviderSetup<string | null>('ExternalEncryptionKey')

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

export const ConditionalHexEncryptionKeyProvider = ({
  children,
}: ChildrenProp) => {
  const externalEncryptionKey = useExternalEncryptionKey()

  const encryptionKey = useMemo(() => {
    if (externalEncryptionKey !== null) {
      return externalEncryptionKey
    }
    return generateHexEncryptionKey()
  }, [externalEncryptionKey])

  return (
    <CurrentHexEncryptionKeyProvider value={encryptionKey}>
      {children}
    </CurrentHexEncryptionKeyProvider>
  )
}
