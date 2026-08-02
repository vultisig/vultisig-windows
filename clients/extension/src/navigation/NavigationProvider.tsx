import { vaultsStorage } from '@core/extension/storage/vaults'
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
import { resolveInitialHistory } from './resolveInitialHistory'

const getInitialHistory = async (): Promise<View[]> => {
  const [initialView, persistedHistory, vaults] = await Promise.all([
    getInitialView(),
    getPersistedHistory(),
    vaultsStorage.getVaults(),
  ])

  if (initialView !== null) {
    await removeInitialView()
  }

  return resolveInitialHistory({
    initialView,
    persistedHistory,
    hasVaults: vaults.length > 0,
  })
}

/**
 * Provides navigation state to the extension app, resolving the initial
 * history from stored state and the vault list before rendering children.
 */
export const NavigationProvider = ({ children }: ChildrenProp) => {
  const { mutate, ...mutationState } = useMutation({
    mutationFn: getInitialHistory,
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
