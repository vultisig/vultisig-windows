import {
  BackgroundInterface,
  BackgroundMethod,
} from '@core/inpage-provider/background/interface'
import { callInpageProviderBridgeBackgroundAgent } from '@core/inpage-provider/bridge'

import { BackgroundApiCall } from './communication/core'

export const callBackgroundApi = async <M extends BackgroundMethod>(
  call: BackgroundApiCall<M>
): Promise<BackgroundInterface[M]['output']> =>
  callInpageProviderBridgeBackgroundAgent({
    background: { call },
  })
