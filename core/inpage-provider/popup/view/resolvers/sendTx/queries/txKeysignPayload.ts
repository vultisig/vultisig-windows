import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { KeysignChainSpecific } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { UtxoInfo } from '@core/mpc/types/vultisig/keysign/v1/utxo_info_pb'
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
  requestOrigin: string
  walletCore: WalletCore
  vault: Vault
  parsedTx: ParsedTx
  transactionPayload: ITransactionPayload
  coin: AccountCoin
  chainSpecific: KeysignChainSpecific
  utxoInfo: UtxoInfo[] | null
}

export const getTxKeysignPayloadQuery = ({ walletCore, ...input }: Input) => ({
  queryKey: ['tx-keysign-payload', input],
  queryFn: () => {
    const {
      parsedTx,
      requestOrigin,
      vault,
      transactionPayload,
      coin,
      chainSpecific,
      utxoInfo,
    } = input
    const keysignPayload = matchRecordUnion<ParsedTx, Promise<KeysignPayload>>(
      parsedTx,
      {
        tx: transaction =>
          getKeysignPayload({
            transaction,
            vault,
            walletCore,
            coin,
            chainSpecific,
          }),
        psbt: psbt =>
          getPsbtKeysignPayload({
            psbt,
            walletCore,
            vault,
            coin,
            chainSpecific,
          }),
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
            coin,
            chainSpecific,
          })
        },
      }
    )

    return {
      ...keysignPayload,
      utxoInfo,
    }
  },
})
