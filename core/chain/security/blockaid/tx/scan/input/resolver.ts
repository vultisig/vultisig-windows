import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WalletCore } from '@trustwallet/wallet-core'

import { BlockaidSupportedChains } from '../../../chains'
import { BlockaidTxScanInput } from '../resolver'

export type BlockaidTxScanInputOptions = {
  payload: KeysignPayload
  walletCore: WalletCore
}

export type BlockaidTxScanInputResolver<
  T extends BlockaidSupportedChains = BlockaidSupportedChains,
> = (
  input: BlockaidTxScanInputOptions & { chain: T }
) => BlockaidTxScanInput | null
