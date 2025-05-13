import { CoreView } from '@core/ui/navigation/CoreView'

export type AppView =
  | CoreView
  | { id: 'onboarding' }
  | { id: 'settings' }
  | { id: 'vaultSettings' }
  | { id: 'connectedDapps' }
  | { id: 'connectTab' }
  | { id: 'vaultsTab' }
  | { id: 'transactionTab' }

export type AppViewId = AppView['id']
