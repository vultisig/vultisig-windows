import { WalletCore } from '@trustwallet/wallet-core'

type isValidMnemonicInput = { mnemonic: string; walletCore: WalletCore }

export const isValidMnemonic = ({
  mnemonic,
  walletCore,
}: isValidMnemonicInput) => walletCore.Mnemonic.isValid(mnemonic)
