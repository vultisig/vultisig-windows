import { queryUrl } from '@lib/utils/query/queryUrl'

import { callPopupApi } from '../../../popup/api/communication/background'
import { apiRef } from '../../../utils/api'
import { BackgroundApiResolver } from '../resolver'

type PluginMetadata = {
  id: string
  title: string
  description: string
  server_endpoint: string
  pricing_id: string
  category_id: string
  created_at: string // ISO date string
  updated_at: string // ISO date string
}

export const pluginReshare: BackgroundApiResolver<'pluginReshare'> = async ({
  input: { pluginId },
}) => {
  const { title } = await queryUrl<PluginMetadata>(
    `${apiRef.pluginMarketPlace}plugins/${pluginId}`
  )

  return callPopupApi({
    pluginReshare: { pluginName: title },
  })
}
