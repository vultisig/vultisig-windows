import { callBackground } from '@core/inpage-provider/background'

export const revokeWalletPermissions = async (): Promise<void> => {
  await callBackground({
    signOut: {},
  })
}
