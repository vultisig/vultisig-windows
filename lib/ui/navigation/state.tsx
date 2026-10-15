import { ChildrenProp } from '@lib/ui/props'
import { Dispatch, SetStateAction, useContext, useState } from 'react'

import { Stateful, statefulToTuple } from '../state/core'
import { createContextHook } from '../state/createContextHook'
import { createProvidedContext } from '../state/createProvidedContext'
import { View } from './View'

type NavigationState = {
  history: View[]
}

const NavigationContext = createProvidedContext<Stateful<NavigationState>>()

// The setter alone, so hooks that only navigate don't re-render on every
// navigation the way a reader of the history does.
const SetNavigationContext =
  createProvidedContext<Dispatch<SetStateAction<NavigationState>>>()

type NavigationProviderProps = ChildrenProp & {
  initialValue: NavigationState
}

export const NavigationProvider = ({
  children,
  initialValue,
}: NavigationProviderProps) => {
  const [value, setValue] = useState(initialValue)

  return (
    <SetNavigationContext value={setValue}>
      <NavigationContext value={{ value, setValue }}>
        {children}
      </NavigationContext>
    </SetNavigationContext>
  )
}

/** The navigation history and its setter; re-renders on every navigation. */
export const useNavigation = createContextHook(
  NavigationContext,
  'Navigation',
  statefulToTuple
)

/** Updates the navigation history without subscribing to it. */
export const useSetNavigation = createContextHook(
  SetNavigationContext,
  'Navigation'
)

/**
 * The navigation history when a `NavigationProvider` is mounted, otherwise
 * `undefined`. Shell-level code that is also hosted without a navigation
 * stack (the extension's dApp popup) reads history through this rather than
 * `useNavigation`, which throws outside the provider.
 */
export const useOptionalNavigationHistory = () =>
  useContext(NavigationContext)?.value.history
