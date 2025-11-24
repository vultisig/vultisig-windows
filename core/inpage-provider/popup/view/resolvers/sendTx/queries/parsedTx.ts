import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Coin } from '@core/chain/coin/Coin'
import { deriveAddress } from '@core/chain/publicKey/address/deriveAddress'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { Query } from '@lib/ui/query/Query'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { usePopupContext } from '../../../state/context'
import { usePopupInput } from '../../../state/input'
import { useGetCoin } from '../core/coin'
import { CustomTxData, getCustomTxData } from '../core/customTxData'
import { ParsedTx } from '../core/parsedTx'
import { getThirdPartyGasLimitEstimation } from '../core/thirdPartyGasLimitEstimation'
import { ITransactionPayload } from '../interfaces'

export const useParsedTxQuery = (): Query<ParsedTx> => {
  const transactionPayload = usePopupInput<'sendTx'>()
  const walletCore = useAssertWalletCore()
  const vault = useCurrentVault()

  const getCoin = useGetCoin()

  const { requestOrigin } = usePopupContext()

  const customTxDataQuery = useQuery({
    queryKey: ['custom-tx-data', transactionPayload],
    queryFn: () =>
      getCustomTxData({
        walletCore,
        vault,
        transactionPayload,
        getCoin,
        requestOrigin,
      }),
    ...noRefetchQueryOptions,
    retry: false,
  })

  const skipBroadcast = useMemo(
    () =>
      matchRecordUnion<ITransactionPayload, boolean | undefined>(
        transactionPayload,
        {
          keysign: ({ transactionDetails }) => transactionDetails.skipBroadcast,
          serialized: ({ skipBroadcast }) => skipBroadcast,
        }
      ),
    [transactionPayload]
  )

  return useTransformQueriesData(
    {
      customTxData: customTxDataQuery,
    },
    useCallback(
      ({ customTxData }) => {
        const coin = matchRecordUnion<CustomTxData, Coin>(customTxData, {
          regular: ({ coin }) => coin,
          solana: tx => {
            const { inputCoin } = getRecordUnionValue(tx)

            return inputCoin
          },
          psbt: () => chainFeeCoin[Chain.Bitcoin],
        })

        const { chain } = coin

        const publicKey = getPublicKey({
          chain,
          walletCore,
          hexChainCode: vault.hexChainCode,
          publicKeys: vault.publicKeys,
        })

        const address = deriveAddress({
          chain,
          publicKey,
          walletCore,
        })

        return {
          thirdPartyGasLimitEstimation:
            getThirdPartyGasLimitEstimation(transactionPayload),
          customTxData,
          skipBroadcast,
          coin: {
            ...coin,
            address,
          },
        }
      },
      [
        vault.hexChainCode,
        vault.publicKeys,
        walletCore,
        skipBroadcast,
        transactionPayload,
      ]
    )
  )
}
