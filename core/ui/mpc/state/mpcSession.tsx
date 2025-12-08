import { ChildrenProp } from '@lib/ui/props'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { createContext, useContext, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'

export const { useValue: useMpcSessionId, provider: MpcSessionIdProvider } =
  getValueProviderSetup<string>('MpcSessionId')

const ExternalSessionIdContext = createContext<string | null | undefined>(
  undefined
)

export const ExternalSessionIdProvider = ({
  children,
  value,
}: ChildrenProp & { value: string | null }) => {
  return (
    <ExternalSessionIdContext.Provider value={value}>
      {children}
    </ExternalSessionIdContext.Provider>
  )
}

const useOptionalExternalSessionId = (): string | null => {
  const context = useContext(ExternalSessionIdContext)
  return context === undefined ? null : (context ?? null)
}

export const GeneratedMpcSessionIdProvider = ({ children }: ChildrenProp) => {
  const MpcSessionId = useMemo(() => uuidv4(), [])

  return (
    <MpcSessionIdProvider value={MpcSessionId}>{children}</MpcSessionIdProvider>
  )
}

export const ConditionalMpcSessionIdProvider = ({ children }: ChildrenProp) => {
  const externalSessionId = useOptionalExternalSessionId()

  const sessionId = useMemo(() => {
    if (externalSessionId !== null) {
      return externalSessionId
    }
    return uuidv4()
  }, [externalSessionId])

  return (
    <MpcSessionIdProvider value={sessionId}>{children}</MpcSessionIdProvider>
  )
}
