import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WalletCore } from '@trustwallet/wallet-core'

import { BlockaidTxScanInput } from '../resolver'

export type BlockaidTxScanInputOptions = {
  payload: KeysignPayload
  walletCore: WalletCore
}

export type BlockaidTxScanInputResolver = (
  input: BlockaidTxScanInputOptions
) => Pick<BlockaidTxScanInput, 'data'> | null
