import { ChildrenProp } from '@lib/ui/props'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { createContext, useMemo } from 'react'
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

export const GeneratedMpcSessionIdProvider = ({ children }: ChildrenProp) => {
  const MpcSessionId = useMemo(() => uuidv4(), [])

  return (
    <MpcSessionIdProvider value={MpcSessionId}>{children}</MpcSessionIdProvider>
  )
}
