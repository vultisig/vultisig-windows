import { NavigationProvider as LibNavigationProvider } from '@lib/ui/navigation/state'
import { ChildrenProp } from '@lib/ui/props'

import { initialPath } from './routes'

export const NavigationProvider = ({ children }: ChildrenProp) => {
  return (
    <LibNavigationProvider
      initialValue={{ history: [{ id: initialPath }], currentIndex: 0 }}
    >
      {children}
    </LibNavigationProvider>
  )
}
