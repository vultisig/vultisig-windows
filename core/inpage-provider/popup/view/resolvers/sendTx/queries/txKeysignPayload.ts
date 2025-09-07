import { Chain } from '@core/chain/Chain'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { FeeSettings } from '@core/ui/vault/send/fee/settings/state/feeSettings'
import { Vault } from '@core/ui/vault/Vault'
import { noPersistQueryOptions } from '@lib/ui/query/utils/options'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { WalletCore } from '@trustwallet/wallet-core'
import { Psbt } from 'bitcoinjs-lib'

import { getKeysignPayload } from '../core/getKeySignPayload'
import { parseSolanaTx } from '../core/solana/parser'
import { getSolanaKeysignPayload } from '../core/solana/solanaKeysignPayload'
import { getPsbtKeysignPayload } from '../core/utxo/getPsbtKeysignPayload'
import { ITransactionPayload } from '../interfaces'

type Input = {
  feeSettings: FeeSettings | null
  transactionPayload: ITransactionPayload
  requestOrigin: string
  walletCore: WalletCore
  vault: Vault
}

export const getTxKeysignPayloadQuery = ({ walletCore, ...input }: Input) => ({
  queryKey: ['tx-keysign-payload', input],
  queryFn: () => {
    const { feeSettings, transactionPayload, requestOrigin, vault } = input
    return matchRecordUnion<ITransactionPayload, Promise<KeysignPayload>>(
      transactionPayload,
      {
        keysign: async transaction =>
          getKeysignPayload({
            transaction,
            vault,
            walletCore,
            feeSettings,
          }),
        serialized: async ({ data, chain, skipBroadcast }) => {
          if (chain === Chain.Bitcoin) {
            const dataBuffer = Buffer.from(data, 'base64')
            const psbt = Psbt.fromBuffer(Buffer.from(dataBuffer))
            return await getPsbtKeysignPayload(
              psbt,
              walletCore,
              vault,
              feeSettings
            )
          } else {
            const serialized = Uint8Array.from(Buffer.from(data, 'base64'))
            const parsed = await parseSolanaTx({
              walletCore,
              inputTx: serialized,
            })

            if (!parsed) {
              throw new Error('Could not parse transaction')
            }
            return await getSolanaKeysignPayload({
              parsed,
              serialized,
              vault,
              walletCore,
              skipBroadcast,
              requestOrigin,
            })
          }
        },
      }
    )
  },
  ...noPersistQueryOptions,
})
