import { Chain } from '@core/chain/Chain'
import { isChainOfKind } from '@core/chain/ChainKind'
import { getEvmContractCallSignatures } from '@core/chain/chains/evm/contract/call/signatures'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { attempt } from '@lib/utils/attempt'
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
          keysign: async tx => {
            if (!isChainOfKind(tx.chain, 'evm')) {
              return { tx }
            }

            const { data } = tx.transactionDetails
            if (!data || data === '0x') {
              return { tx }
            }

            const { data: potentialData } = await attempt(
              getEvmContractCallSignatures(data)
            )

            return {
              tx: {
                ...tx,
                isEvmContractCall: potentialData && potentialData.count > 0,
              },
            }
          },
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
