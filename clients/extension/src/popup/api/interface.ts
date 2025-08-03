import { ApiMethod } from '@lib/utils/api/ApiMethod'

export type PopupApiInterface = {
  grantVaultAccess: ApiMethod<{}, { vaultId: string }>
}

export type PopupApiMethodName = keyof PopupApiInterface
