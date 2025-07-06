import { useCurrentVaultSecurityType } from '@core/ui/vault/state/currentVault'

import { VaultSecurityType } from '../../../vault/VaultSecurityType'
import { FastVaultStartKeysignPrompt } from './FastVaultStartKeysignPrompt'
import { SecureVaultStartKeysignPrompt } from './SecureVaultStartKeysignPrompt'
import { StartKeysignPromptProps } from './StartKeysignPromptProps'

const SecurityBasedStartKeysignPrompt: Record<
  VaultSecurityType,
  React.FC<StartKeysignPromptProps>
> = {
  secure: SecureVaultStartKeysignPrompt,
  fast: FastVaultStartKeysignPrompt,
}

export const StartKeysignPrompt = (props: StartKeysignPromptProps) => {
  const securityType = useCurrentVaultSecurityType()

  const Prompt = SecurityBasedStartKeysignPrompt[securityType]

  return <Prompt {...props} />
}
