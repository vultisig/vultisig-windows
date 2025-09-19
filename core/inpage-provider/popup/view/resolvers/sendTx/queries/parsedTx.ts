import { Chain } from '@core/chain/Chain'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { useQuery } from '@tanstack/react-query'
import { Psbt } from 'bitcoinjs-lib'

import { usePopupInput } from '../../../state/input'
import { ParsedTx } from '../core/parsedTx'
import { parseSolanaTx } from '../core/solana/parser'
import { ITransactionPayload } from '../interfaces'

export const useParsedTxQuery = () => {
  const transactionPayload = usePopupInput<'sendTx'>()
  const walletCore = useAssertWalletCore()

  return useQuery({
    queryKey: ['parsed-tx', transactionPayload],
    queryFn: () => {
      return matchRecordUnion<ITransactionPayload, Promise<ParsedTx>>(
        transactionPayload,
        {
          keysign: async tx => ({
            tx,
          }),
          serialized: async ({ data, chain }) => {
            if (chain === Chain.Bitcoin) {
              const dataBuffer = Buffer.from(data, 'base64')
              const psbt = Psbt.fromBuffer(Buffer.from(dataBuffer))

              return { psbt }
            }

            const serialized = Uint8Array.from(Buffer.from(data, 'base64'))
            const solanaTx = await parseSolanaTx({
              walletCore,
              inputTx: serialized,
            })

            return { solanaTx }
          },
        }
      )
    },
    retry: false,
  })
}
