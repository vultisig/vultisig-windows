import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { FeeSettings } from '@core/ui/vault/send/fee/settings/state/feeSettings'
import { Vault } from '@core/ui/vault/Vault'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { WalletCore } from '@trustwallet/wallet-core'

import { getKeysignPayload } from '../core/getKeySignPayload'
import { ParsedTx } from '../core/parsedTx'
import { getSolanaKeysignPayload } from '../core/solana/solanaKeysignPayload'
import { getPsbtKeysignPayload } from '../core/utxo/getPsbtKeysignPayload'
import { ITransactionPayload } from '../interfaces'

type Input = {
  feeSettings: FeeSettings | null
  requestOrigin: string
  walletCore: WalletCore
  vault: Vault
  parsedTx: ParsedTx
  transactionPayload: ITransactionPayload
}

export const getTxKeysignPayloadQuery = ({ walletCore, ...input }: Input) => ({
  queryKey: ['tx-keysign-payload', input],
  queryFn: () => {
    const { feeSettings, parsedTx, requestOrigin, vault, transactionPayload } =
      input
    return matchRecordUnion<ParsedTx, Promise<KeysignPayload>>(parsedTx, {
      tx: transaction =>
        getKeysignPayload({
          transaction,
          vault,
          walletCore,
          feeSettings,
        }),
      psbt: psbt => getPsbtKeysignPayload(psbt, walletCore, vault, feeSettings),
      solanaTx: solanaTx => {
        const { data, skipBroadcast } = getRecordUnionValue(
          transactionPayload,
          'serialized'
        )

        return getSolanaKeysignPayload({
          parsed: solanaTx,
          serialized: Uint8Array.from(Buffer.from(data, 'base64')),
          vault,
          walletCore,
          skipBroadcast,
          requestOrigin,
        })
      },
    })
  },
})
