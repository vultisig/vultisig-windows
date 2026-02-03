import { ChildrenProp } from '@lib/ui/props'

import { CreateVaultFormStateProviders } from './CreateVaultFormStateProviders'

export const CreateVaultFlowProviders = ({ children }: ChildrenProp) => {
  return (
    <CreateVaultFormStateProviders>{children}</CreateVaultFormStateProviders>
  )
}
