import { CoreView } from '@core/ui/navigation/CoreView'

export type AppView =
  | CoreView
  | { id: 'onboarding' }
  | { id: 'connectedDapps' }
  | { id: 'connectTab' }
  | { id: 'vaultsTab' }
  | { id: 'transactionTab' }
  | { id: 'pluginTab' }

export type AppViewId = AppView['id']
