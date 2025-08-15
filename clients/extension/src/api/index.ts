import { PopupMessage } from '@core/inpage-provider/popup/resolver'

import { BackgroundApiMessage } from '../background/api/communication/core'

export type ExtensionApiMessage =
  | {
      background: BackgroundApiMessage
    }
  | {
      popup: PopupMessage
    }
