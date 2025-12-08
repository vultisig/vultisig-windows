import { generateHexEncryptionKey } from '@core/mpc/utils/generateHexEncryptionKey'
import { ChildrenProp } from '@lib/ui/props'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { createContext, useContext, useMemo } from 'react'

export const {
  useValue: useCurrentHexEncryptionKey,
  provider: CurrentHexEncryptionKeyProvider,
} = getValueProviderSetup<string>('CurrentHexEncryptionKey')

const ExternalEncryptionKeyContext = createContext<string | null | undefined>(
  undefined
)

export const ExternalEncryptionKeyProvider = ({
  children,
  value,
}: ChildrenProp & { value: string | null }) => {
  return (
    <ExternalEncryptionKeyContext.Provider value={value}>
      {children}
    </ExternalEncryptionKeyContext.Provider>
  )
}

const useOptionalExternalEncryptionKey = (): string | null => {
  const context = useContext(ExternalEncryptionKeyContext)
  return context === undefined ? null : (context ?? null)
}

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
  const externalEncryptionKey = useOptionalExternalEncryptionKey()

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
