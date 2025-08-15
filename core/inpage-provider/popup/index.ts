import {
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import {
  PopupCall,
  PopupCallResolver,
  PopupOptions,
} from '@core/inpage-provider/popup/resolver'
import { getProviderSource, ProviderSource } from '@core/inpage-provider/source'

import { callPopupFromBackground } from './resolvers/background'
import { callPopupFromInpage } from './resolvers/inpage'

const resolvers: Record<ProviderSource, PopupCallResolver<any>> = {
  background: callPopupFromBackground,
  inpage: callPopupFromInpage,
}

export const callPopup = async <M extends PopupMethod>(
  call: PopupCall<M>,
  options: PopupOptions = { closeOnFinish: true }
): Promise<PopupInterface[M]['output']> => {
  const source = getProviderSource()

  return resolvers[source]({ call, options })
}
