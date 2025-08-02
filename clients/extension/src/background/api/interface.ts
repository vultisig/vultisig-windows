import { VaultExport } from '../../utils/interfaces'

type ApiMethod<Input, Output> = {
  input: Input
  output: Output
}

export type BackgroundApiInterface = {
  getVault: ApiMethod<
    {
      dappHostname: string
    },
    VaultExport
  >
}
