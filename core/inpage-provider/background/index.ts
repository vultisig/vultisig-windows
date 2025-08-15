import {
  BackgroundInterface,
  BackgroundMethod,
} from '@core/inpage-provider/background/interface'
import { BackgroundCall } from '@core/inpage-provider/background/resolver'
import { callInpageProviderBridgeBackgroundAgent } from '@core/inpage-provider/bridge'

export const callBackground = async <M extends BackgroundMethod>(
  call: BackgroundCall<M>
): Promise<BackgroundInterface[M]['output']> =>
  callInpageProviderBridgeBackgroundAgent({
    background: { call },
  })
