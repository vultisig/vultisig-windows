import { BackgroundApiMessage } from '@clients/extension/src/background/api/communication/core'

import { PopupMessage } from '../popup/resolver'

export type InpageProviderBridgeMessage =
  | {
      background: BackgroundApiMessage
    }
  | {
      popup: PopupMessage
    }
