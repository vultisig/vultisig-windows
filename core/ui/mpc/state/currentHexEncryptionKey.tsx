import { generateHexEncryptionKey } from '@core/mpc/utils/generateHexEncryptionKey'
import { ChildrenProp } from '@lib/ui/props'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { useMemo } from 'react'

export const {
  useValue: useCurrentHexEncryptionKey,
  provider: CurrentHexEncryptionKeyProvider,
} = getValueProviderSetup<string>('CurrentHexEncryptionKey')

export const {
  useValue: useDAppEncryptionKey,
  provider: DAppEncryptionKeyProvider,
} = getValueProviderSetup<string | undefined>('DAppEncryptionKey')

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
  const dAppEncryptionKey = useDAppEncryptionKey()

  const encryptionKey = useMemo(() => {
    if (dAppEncryptionKey) {
      return dAppEncryptionKey
    }
    return generateHexEncryptionKey()
  }, [dAppEncryptionKey])

  return (
    <CurrentHexEncryptionKeyProvider value={encryptionKey}>
      {children}
    </CurrentHexEncryptionKeyProvider>
  )
}
