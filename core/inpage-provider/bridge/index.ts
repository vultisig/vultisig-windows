import { BackgroundApiCall } from '@clients/extension/src/background/api/communication/core'
import {
  BackgroundInterface,
  BackgroundMethod,
} from '@core/inpage-provider/background/interface'
import {
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { PopupCall, PopupOptions } from '@core/inpage-provider/popup/resolver'
import { sendToBackground } from '@lib/extension/bridge/inpage'
import { Result } from '@lib/utils/types/Result'

import { InpageProviderBridgeMessage } from './message'

export function callInpageProviderBridgeBackgroundAgent<
  M extends BackgroundMethod,
>(message: {
  background: { call: BackgroundApiCall<M> }
}): Promise<BackgroundInterface[M]['output']>
export function callInpageProviderBridgeBackgroundAgent<
  M extends PopupMethod,
>(message: {
  popup: { call: PopupCall<M>; options: PopupOptions }
}): Promise<PopupInterface[M]['output']>
export async function callInpageProviderBridgeBackgroundAgent(
  message: InpageProviderBridgeMessage
): Promise<unknown> {
  const { error, data } = await sendToBackground<Result<unknown>>(message)

  if (data) {
    return data
  }

  throw error
}
