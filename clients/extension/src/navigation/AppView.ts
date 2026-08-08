import { CoreView } from '@core/ui/navigation/CoreView'

export type AppView =
  | CoreView
  | { id: 'onboarding' }
  | { id: 'connectedDapps' }
  | { id: 'stationMigration'; state?: { source?: 'setup' | 'settings' } }

export type AppViewId = AppView['id']
