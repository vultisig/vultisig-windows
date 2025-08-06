import { callPopupApi } from '../../../popup/api/communication/background'
import { BackgroundApiResolver } from '../resolver'

export const pluginReshare: BackgroundApiResolver<
  'pluginReshare'
> = async () => {
  return callPopupApi({ pluginReshare: {} })
}
