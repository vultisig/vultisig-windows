import { getRecordUnionKey } from '@lib/utils/record/union/getRecordUnionKey'

import { ExtensionApiResolver } from '../../api/resolver'
import { BackgroundApiMessage } from './communication/core'
import { BackgroundApiInterface } from './interface'
import { authorizedDapp } from './middleware/authorizedDapp'
import { BackgroundApiResolver } from './resolver'
import { getVault } from './resolvers/getVault'
import { getVaults } from './resolvers/getVaults'

type BackgroundApiImplementation = {
  [K in keyof BackgroundApiInterface]: BackgroundApiResolver<K>
}

export const backgroundApi: BackgroundApiImplementation = {
  getVault: authorizedDapp(getVault),
  getVaults,
}

export const backgroundApiResolver: ExtensionApiResolver<
  BackgroundApiMessage
> = ({ message, context }) => {
  const method = getRecordUnionKey(call)

  const handler = backgroundApi[method as BackgroundApiMethodName]
  if (!handler) return
}
