import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

export const { useState: useEmail, provider: EmailProvider } =
  getStateProviderSetup<string>('Email')
