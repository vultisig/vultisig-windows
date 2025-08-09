import { ApiMethod } from '@lib/utils/api/ApiMethod'

export type PopupApiInterface = {
  grantVaultAccess: ApiMethod<{}, { vaultId: string }>
  grantVaultsAccess: ApiMethod<{}, { vaultIds: string[] }>
  pluginReshare: ApiMethod<{ pluginId: string }, { joinUrl: string }>
}

export type PopupApiMethodName = keyof PopupApiInterface
