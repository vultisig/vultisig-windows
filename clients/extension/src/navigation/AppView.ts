import { PopupCall } from '@core/inpage-provider/popup/resolver'
import { CoreView } from '@core/ui/navigation/CoreView'

export type AppView =
  | CoreView
  | { id: 'onboarding' }
  | { id: 'connectedDapps' }
  | { id: 'connectTab' }
  | { id: 'transactionTab' }
  | { id: 'popupApi'; state: { call: PopupCall<any> } }

export type AppViewId = AppView['id']
