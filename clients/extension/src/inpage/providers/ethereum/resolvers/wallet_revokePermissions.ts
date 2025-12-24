import { callBackground } from '@core/inpage-provider/background'

import { EthereumResolver } from '../resolver'

export const revokeWalletPermissions: EthereumResolver<
  void,
  void
> = async () => {
  await callBackground({
    signOut: {},
  })
}
