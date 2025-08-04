import { CoreView } from '@core/ui/navigation/CoreView'

import { PopupApiCall } from '../popup/api/communication/core'

export type AppView =
  | CoreView
  | { id: 'onboarding' }
  | { id: 'connectedDapps' }
  | { id: 'connectTab' }
  | { id: 'vaultsTab' }
  | { id: 'transactionTab' }
  | { id: 'pluginTab' }
  | { id: 'popupApi'; state: { call: PopupApiCall<any> } }

export type AppViewId = AppView['id']
