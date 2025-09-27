import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { isChainOfKind } from '@core/chain/ChainKind'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { areEqualCoins } from '@core/chain/coin/Coin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { getSwapKeysignPayloadFields } from '@core/chain/swap/keysign/getSwapKeysignPayloadFields'
import { SwapQuote } from '@core/chain/swap/quote/SwapQuote'
import { EvmFeeQuote } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { byteFeeMultiplier } from '@core/chain/tx/fee/utxo/UtxoFeeSettings'
import { ChainSpecificResolverInput } from '@core/mpc/keysign/chainSpecific/resolver'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { usePotentialQuery } from '@lib/ui/query/hooks/usePotentialQuery'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useMemo } from 'react'

import { getChainSpecificQuery } from '../../../chain/coin/queries/useChainSpecificQuery'
import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useFromAmount } from '../state/fromAmount'
import { useToCoin } from '../state/toCoin'
import { useSwapQuoteQuery } from './useSwapQuoteQuery'

export const useSwapChainSpecificQuery = () => {
  const [{ coin: fromCoinKey }] = useCoreViewState<'swap'>()
  const fromCoin = useCurrentVaultCoin(fromCoinKey)

  const [toCoinKey] = useToCoin()
  const toCoin = useCurrentVaultCoin(toCoinKey)

  const [fromAmount] = useFromAmount()

  const swapQuoteQuery = useSwapQuoteQuery()

  const walletCore = useAssertWalletCore()

  const vault = useCurrentVault()

  const queryInput: ChainSpecificResolverInput | undefined = useMemo(() => {
    const { data: swapQuote } = swapQuoteQuery

    if (!swapQuote) {
      return
    }

    if (!fromAmount) {
      return
    }

    const fromPublicKey = getPublicKey({
      chain: fromCoin.chain,
      walletCore,
      hexChainCode: vault.hexChainCode,
      publicKeys: vault.publicKeys,
    })

    const toPublicKey = getPublicKey({
      chain: toCoin.chain,
      walletCore,
      hexChainCode: vault.hexChainCode,
      publicKeys: vault.publicKeys,
    })

    const { toAddress } = getSwapKeysignPayloadFields({
      amount: toChainAmount(fromAmount, fromCoin.decimals),
      quote: swapQuote,
      fromCoin: {
        ...fromCoin,
        hexPublicKey: Buffer.from(fromPublicKey.data()).toString('hex'),
      },
      toCoin: {
        ...toCoin,
        hexPublicKey: Buffer.from(toPublicKey.data()).toString('hex'),
      },
    })

    const input: ChainSpecificResolverInput = {
      coin: fromCoin,
      amount: toChainAmount(fromAmount, fromCoin.decimals),
      receiver: toAddress,
      data: matchRecordUnion<SwapQuote, string | undefined>(swapQuote, {
        native: () => undefined,
        general: ({ tx }) => getRecordUnionValue(tx).data,
      }),
      isDeposit: matchRecordUnion<SwapQuote, boolean>(swapQuote, {
        native: ({ swapChain }) =>
          areEqualCoins(fromCoinKey, chainFeeCoin[swapChain]),
        general: () => false,
      }),
      byteFeeMultiplier: isChainOfKind(fromCoin.chain, 'utxo')
        ? byteFeeMultiplier.fast
        : undefined,
      feeQuote: matchRecordUnion<SwapQuote, Partial<EvmFeeQuote> | undefined>(
        swapQuote,
        {
          native: () => undefined,
          general: ({ tx }) =>
            matchRecordUnion(tx, {
              evm: ({ feeQuote }) => feeQuote,
              solana: () => undefined,
            }),
        }
      ),
    }

    return input
  }, [
    fromAmount,
    fromCoin,
    fromCoinKey,
    swapQuoteQuery,
    toCoin,
    vault.hexChainCode,
    vault.publicKeys,
    walletCore,
  ])

  return usePotentialQuery(queryInput, getChainSpecificQuery)
}
