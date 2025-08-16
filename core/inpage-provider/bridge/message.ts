import { BackgroundMessage } from '../background/resolver'
import { PopupMessage } from '../popup/resolver'

export type InpageProviderBridgeMessage =
  | {
      background: BackgroundMessage
    }
  | {
      popup: PopupMessage
    }
