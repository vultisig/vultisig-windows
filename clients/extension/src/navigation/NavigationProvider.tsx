import { initialCoreView } from '@core/ui/navigation/CoreView'
import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { NavigationProvider as CoreNavigationProvider } from '@lib/ui/navigation/state'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'

import { getInitialView, removeInitialView } from '../storage/initialView'

export const NavigationProvider = ({ children }: ChildrenProp) => {
  const { mutate, ...mutationState } = useMutation({
    mutationFn: getInitialView,
    onSuccess: async initialView => {
      if (initialView !== null) {
        await removeInitialView()
      }
    },
  })

  useEffect(() => {
    mutate()
  }, [mutate])

  return (
    <MatchQuery
      value={mutationState}
      success={initialView => (
        <CoreNavigationProvider
          initialValue={{ history: [initialView || initialCoreView] }}
        >
          {children}
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
