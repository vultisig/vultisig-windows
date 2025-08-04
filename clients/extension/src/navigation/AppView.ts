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
  // Most likely popupApi should be in a dedicated app(Extension's HTML page) e.g. popup-api.html
  // TODO: @rcoderdev move popupApi to a dedicated app
  | { id: 'popupApi'; state: { call: PopupApiCall<any> } }

export type AppViewId = AppView['id']
