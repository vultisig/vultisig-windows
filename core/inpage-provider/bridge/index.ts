import {
  BackgroundInterface,
  BackgroundMethod,
} from '@core/inpage-provider/background/interface'
import {
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { PopupMessage } from '@core/inpage-provider/popup/resolver'
import { sendToBackground } from '@lib/extension/bridge/inpage'
import { Result } from '@lib/utils/types/Result'

import { BackgroundMessage } from '../background/resolver'
import { InpageProviderBridgeMessage } from './message'

export function callInpageProviderBridgeBackgroundAgent<
  M extends BackgroundMethod,
>(message: {
  background: BackgroundMessage<M>
}): Promise<BackgroundInterface[M]['output']>

export function callInpageProviderBridgeBackgroundAgent<
  M extends PopupMethod,
>(message: { popup: PopupMessage<M> }): Promise<PopupInterface[M]['output']>

export async function callInpageProviderBridgeBackgroundAgent(
  message: InpageProviderBridgeMessage
): Promise<unknown> {
  const { error, data } = await sendToBackground<Result<unknown>>(message)

  if (error) {
    throw error
  }

  return data
}
