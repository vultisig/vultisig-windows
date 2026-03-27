import { Chain } from '@core/chain/Chain'
import { getPsbtTransferInfo } from '@core/chain/chains/utxo/tx/getPsbtTransferInfo'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { BlockaidEvmSimulationInfo } from '@core/chain/security/blockaid/tx/simulation/core'
import { usePotentialQuery } from '@lib/ui/query/hooks/usePotentialQuery'
import { Query } from '@lib/ui/query/Query'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { Psbt } from 'bitcoinjs-lib'
import { useMemo } from 'react'

import { ParsedTx } from '../core/parsedTx'

const getPsbtTransferInfoQueryOptions = (input: {
  psbt: Psbt
  address: string
}) => ({
  queryKey: ['psbt-transfer-info', input.address, input.psbt.toBuffer().length],
  queryFn: async (): Promise<BlockaidEvmSimulationInfo> => {
    try {
      const { sendAmount } = getPsbtTransferInfo(input.psbt, input.address)
      const fromCoin = chainFeeCoin[Chain.Bitcoin]
      return {
        transfer: {
          fromCoin,
          fromAmount: sendAmount,
        },
      }
    } catch (error) {
      throw new Error(
        `PSBT parsing failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  },
  ...noRefetchQueryOptions,
})

type UsePsbtTransferInfoQueryInput = {
  parsedTx: ParsedTx
}

export const usePsbtTransferInfoQuery = ({
  parsedTx,
}: UsePsbtTransferInfoQueryInput): Query<
  BlockaidEvmSimulationInfo | undefined
> => {
  const input = useMemo(() => {
    if (
      parsedTx.coin.chain !== Chain.Bitcoin ||
      !('psbt' in parsedTx.customTxData)
    ) {
      return undefined
    }
    return {
      psbt: parsedTx.customTxData.psbt,
      address: parsedTx.coin.address,
    }
  }, [parsedTx])

  return usePotentialQuery(
    input,
    getPsbtTransferInfoQueryOptions,
    undefined
  ) as Query<BlockaidEvmSimulationInfo | undefined>
}
