import { setupStateProvider } from '../state/setupStateProvider'
import { View } from './View'

type NavigationState = {
  history: View[]
}

export const [NavigationProvider, useNavigation] =
  setupStateProvider<NavigationState>('Navigation')
