import { ChildrenProp } from '@lib/ui/props'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'

export const { useValue: useMpcSessionId, provider: MpcSessionIdProvider } =
  getValueProviderSetup<string>('MpcSessionId')

export const {
  useValue: useExternalSessionId,
  provider: ExternalSessionIdProvider,
} = getValueProviderSetup<string | null>('ExternalSessionId')

export const GeneratedMpcSessionIdProvider = ({ children }: ChildrenProp) => {
  const MpcSessionId = useMemo(() => uuidv4(), [])

  return (
    <MpcSessionIdProvider value={MpcSessionId}>{children}</MpcSessionIdProvider>
  )
}

export const ConditionalMpcSessionIdProvider = ({ children }: ChildrenProp) => {
  const externalSessionId = useExternalSessionId()

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
