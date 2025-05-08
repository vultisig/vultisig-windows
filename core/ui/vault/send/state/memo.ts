import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

export const { useState: useSendMemo, provider: SendMemoProvider } =
  getStateProviderSetup<string>('SendMemo')
