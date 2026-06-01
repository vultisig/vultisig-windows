import { setupValueProvider } from '@lib/ui/state/setupValueProvider'
import { Chain } from '@vultisig/core-chain/Chain'

export type MnemonicKeyImportInput = {
  kind?: 'mnemonic'
  mnemonic: string
  chains: Chain[]
  usePhantomSolanaPath?: boolean
}

export type StationTerraRootKeyImportInput = {
  kind: 'stationTerraRoot'
  privateKeyHex: string
  publicKeyHex: string
  chains: Chain[]
  stationMigration?: {
    walletId: string
    walletName: string
    source: 'mnemonic' | 'seed' | 'privateKey'
  }
}

export type KeyImportInput =
  | MnemonicKeyImportInput
  | StationTerraRootKeyImportInput

export const isStationTerraRootKeyImportInput = (
  input: KeyImportInput
): input is StationTerraRootKeyImportInput => input.kind === 'stationTerraRoot'

export const [KeyImportInputProvider, useKeyImportInput] =
  setupValueProvider<KeyImportInput>('KeyImportInput')
