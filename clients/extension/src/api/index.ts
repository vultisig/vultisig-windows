import { BackgroundApiMessage } from '../background/api/communication/core'
import { PopupApiMessage } from '../popup/api/communication/core'

export type ExtensionApiMessage =
  | {
      background: BackgroundApiMessage
    }
  | {
      popup: PopupApiMessage
    }
