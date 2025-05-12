import { getStateProviderSetup } from '../state/getStateProviderSetup'
import { View } from './View'

type NavigationState = {
  history: View[]
}

export const { useState: useNavigation, provider: NavigationProvider } =
  getStateProviderSetup<NavigationState>('Navigation')
