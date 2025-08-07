import { getPlugin } from '@core/ui/plugins/core/get'

import { callPopupApi } from '../../../popup/api/communication/background'
import { BackgroundApiResolver } from '../resolver'

export const pluginReshare: BackgroundApiResolver<'pluginReshare'> = async ({
  input: { pluginId },
}) => {
  const { title } = await getPlugin(pluginId)

  return callPopupApi(
    {
      pluginReshare: { pluginName: title },
    },
    { closeOnFinish: false }
  )
}
