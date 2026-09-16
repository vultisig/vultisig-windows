import { useGetCoin } from '@core/ui/chain/coin/useGetCoin'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useTonWalletVersion } from '@core/ui/storage/tonW5Enabled'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCombineQueries } from '@lib/ui/query/hooks/useCombineQueries'
import { Query } from '@lib/ui/query/Query'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { getChainAddress } from '@vultisig/core-chain/publicKey/address/getChainAddress'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'
import { useMemo } from 'react'

import { usePopupContext } from '../../../state/context'
import { usePopupInput } from '../../../state/input'
import { CustomTxData, getCustomTxData } from '../core/customTxData'
import { ParsedTx } from '../core/parsedTx'
import { getThirdPartyGasLimitEstimation } from '../core/thirdPartyGasLimitEstimation'
import { ITransactionPayload } from '../interfaces'

export const useParsedTxQuery = (): Query<ParsedTx> => {
  const transactionPayload = usePopupInput<'sendTx'>()
  const walletCore = useAssertWalletCore()
  const vault = useCurrentVault()

  const getCoin = useGetCoin()

  // A TON vault can sit on either of its two wallet contracts, and they are
  // different addresses holding different balances. Deriving the default here
  // would build the payload for an address the funds are not at.
  const tonWalletVersion = useTonWalletVersion()

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

  return useCombineQueries({
    queries: {
      customTxData: customTxDataQuery,
    },
    joinData: ({ customTxData }) => {
      const coin = matchRecordUnion<CustomTxData, Coin>(customTxData, {
        regular: ({ coin }) => coin,
        solana: tx => {
          const { inputCoin } = getRecordUnionValue(tx)

          return inputCoin
        },
        psbt: () => chainFeeCoin[Chain.Bitcoin],
        polkadot: ({ chain }) => chainFeeCoin[chain],
        sui: () => chainFeeCoin[Chain.Sui],
        ripple: () => chainFeeCoin[Chain.Ripple],
      })

      const { chain } = coin

      const address = getChainAddress({
        chain,
        walletCore,
        hexChainCode: vault.hexChainCode,
        publicKeys: vault.publicKeys,
        publicKeyMldsa: vault.publicKeyMldsa,
        chainPublicKeys: vault.chainPublicKeys,
        tonWalletVersion,
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
    eager: false,
  })
}
