import { initialCoreView } from '@core/ui/navigation/CoreView'
import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { NavigationProvider as CoreNavigationProvider } from '@lib/ui/navigation/state'
import { View } from '@lib/ui/navigation/View'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'

import { getInitialView, removeInitialView } from '../storage/initialView'
import { getPersistedHistory } from '../storage/persistedView'
import { PersistNavigationState } from './PersistNavigationState'

const resolveInitialHistory = async (): Promise<View[]> => {
  const initialView = await getInitialView()
  if (initialView !== null) {
    await removeInitialView()
    return [initialView]
  }

  const persistedHistory = await getPersistedHistory()
  if (persistedHistory !== null && persistedHistory.length > 0) {
    return persistedHistory
  }

  return [initialCoreView]
}

export const NavigationProvider = ({ children }: ChildrenProp) => {
  const { mutate, ...mutationState } = useMutation({
    mutationFn: resolveInitialHistory,
  })

  useEffect(() => {
    mutate()
  }, [mutate])

  return (
    <MatchQuery
      value={mutationState}
      success={history => (
        <CoreNavigationProvider initialValue={{ history }}>
          <PersistNavigationState>{children}</PersistNavigationState>
        </CoreNavigationProvider>
      )}
      pending={() => (
        <Center>
          <Spinner />
        </Center>
      )}
      error={() => (
        <Center>
          <Text>Failed to load initial view</Text>
        </Center>
      )}
    />
  )
}
