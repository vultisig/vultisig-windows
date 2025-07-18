import { getPersistentStateProviderSetup } from '@lib/ui/state/getPersistentStateProviderSetup'

const getKey = (vaultId?: string) => `send_memo_${vaultId ?? 'unknown'}`

export const { useState: useSendMemo, provider: SendMemoProvider } =
  getPersistentStateProviderSetup<string>('SendMemo', getKey)
