import { RootCurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { ChildrenProp } from '@lib/ui/props'
import { FC } from 'react'

export const WithCurrentVault: FC<ChildrenProp> = ({ children }) => {
  return <RootCurrentVaultProvider>{children}</RootCurrentVaultProvider>
}
