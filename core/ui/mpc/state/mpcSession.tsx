import { ChildrenProp } from '@lib/ui/props'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'

export const { useValue: useMpcSessionId, provider: MpcSessionIdProvider } =
  getValueProviderSetup<string>('MpcSessionId')

export const { useValue: useDAppSessionId, provider: DAppSessionIdProvider } =
  getValueProviderSetup<string | undefined>('DAppSessionId')

export const GeneratedMpcSessionIdProvider = ({ children }: ChildrenProp) => {
  const MpcSessionId = useMemo(() => uuidv4(), [])

  return (
    <MpcSessionIdProvider value={MpcSessionId}>{children}</MpcSessionIdProvider>
  )
}

export const ConditionalMpcSessionIdProvider = ({ children }: ChildrenProp) => {
  const dAppSessionId = useDAppSessionId()

  const sessionId = useMemo(() => {
    if (dAppSessionId) {
      return dAppSessionId
    }
    return uuidv4()
  }, [dAppSessionId])

  return (
    <MpcSessionIdProvider value={sessionId}>{children}</MpcSessionIdProvider>
  )
}
