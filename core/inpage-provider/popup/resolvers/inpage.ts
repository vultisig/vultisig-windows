import { callInpageProviderBridgeBackgroundAgent } from '@core/inpage-provider/bridge'
import { PopupMethod } from '@core/inpage-provider/popup/interface'

import { PopupCallResolver, PopupCallResolverInput } from '../resolver'

export const callPopupFromInpage: PopupCallResolver = async <
  M extends PopupMethod,
>({
  call,
  options,
}: PopupCallResolverInput<M>) =>
  callInpageProviderBridgeBackgroundAgent({
    popup: { call, options },
  })
