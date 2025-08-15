import { Method } from '@lib/utils/types/Method'

export type PopupInterface = {
  grantVaultAccess: Method<{}, { vaultId: string }>
  grantVaultsAccess: Method<{}, { vaultIds: string[] }>
  pluginReshare: Method<{ pluginId: string }, { joinUrl: string }>
}

export type PopupMethod = keyof PopupInterface
