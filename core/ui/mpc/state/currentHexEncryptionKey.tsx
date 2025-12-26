import { generateHexEncryptionKey } from '@core/mpc/utils/generateHexEncryptionKey'
import { ChildrenProp } from '@lib/ui/props'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { createContext, useMemo } from 'react'

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

export const GeneratedHexEncryptionKeyProvider = ({
  children,
}: ChildrenProp) => {
  const HexEncryptionKey = useMemo(() => generateHexEncryptionKey(), [])

  return (
    <CurrentHexEncryptionKeyProvider value={HexEncryptionKey}>
      {children}
    </CurrentHexEncryptionKeyProvider>
  )
}
