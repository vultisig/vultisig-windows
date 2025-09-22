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
import { useQuery } from '@tanstack/react-query'

import { usePopupInput } from '../../../state/input'
import { useGetCoin } from '../core/coin'
import { CustomTxData, getCustomTxData } from '../core/customTxData'
import { getFeeSettings } from '../core/feeSettings'
import { ParsedTx } from '../core/parsedTx'

export const useParsedTxQuery = (): Query<ParsedTx> => {
  const transactionPayload = usePopupInput<'sendTx'>()
  const walletCore = useAssertWalletCore()
  const vault = useCurrentVault()

  const getCoin = useGetCoin()

  const customTxDataQuery = useQuery({
    queryKey: ['custom-tx-data', transactionPayload],
    queryFn: () => getCustomTxData({ walletCore, transactionPayload, getCoin }),
    ...noRefetchQueryOptions,
    retry: false,
  })

  const feeSettingsQuery = useQuery({
    queryKey: ['fee-settings', transactionPayload],
    queryFn: () => getFeeSettings(transactionPayload),
    ...noRefetchQueryOptions,
    retry: false,
  })

  return useTransformQueriesData(
    {
      feeSettings: feeSettingsQuery,
      customTxData: customTxDataQuery,
    },
    ({ feeSettings, customTxData }) => {
      const coin = matchRecordUnion<CustomTxData, Coin>(customTxData, {
        regular: ({ coin }) => coin,
        solanaSwap: ({ inputCoin }) => inputCoin,
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
        feeSettings,
        customTxData,
        coin: {
          ...coin,
          address,
        },
      }
    }
  )
}
