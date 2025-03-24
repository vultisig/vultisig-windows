import { getStateProviderSetup } from '../../../../lib/ui/state/getStateProviderSetup'

export const { useState: useVaultEmail, provider: EmailProvider } =
  getStateProviderSetup<string>('Email')
