import { VaultExport } from '@core/ui/vault/export/core'

type ApiMethod<Input, Output> = {
  input: Input
  output: Output
}

export type BackgroundApiInterface = {
  getVault: ApiMethod<undefined, VaultExport>
}

export type BackgroundApiMethodName = keyof BackgroundApiInterface
