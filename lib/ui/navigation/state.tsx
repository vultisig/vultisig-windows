import { useContext } from 'react'

import { setupStateProvider } from '../state/setupStateProvider'
import { View } from './View'

type NavigationState = {
  history: View[]
}

const [NavigationProvider, useNavigation, NavigationContext] =
  setupStateProvider<NavigationState>('Navigation')

export { NavigationProvider, useNavigation }

/**
 * The navigation history when a `NavigationProvider` is mounted, otherwise
 * `undefined`. Shell-level code that is also hosted without a navigation
 * stack (the extension's dApp popup) reads history through this rather than
 * `useNavigation`, which throws outside the provider.
 */
export const useOptionalNavigationHistory = () =>
  useContext(NavigationContext)?.value.history
