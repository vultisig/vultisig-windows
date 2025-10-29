import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { getChainKind, isChainOfKind } from '@core/chain/ChainKind'
import { getSwapDestinationAddress } from '@core/chain/swap/keysign/getSwapDestinationAddress'
import { useFeeQuoteQuery } from '@core/ui/chain/feeQuote/query'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useMemo } from 'react'

import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { useFromAmount } from '../state/fromAmount'
import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapQuote } from './useSwapQuoteQuery'
import { useCurrentVault } from '../../state/currentVault'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'

export const useSwapFeeQuoteQuery = () => {
  const [fromCoinKey] = useSwapFromCoin()
  const fromCoin = useCurrentVaultCoin(fromCoinKey)
  const [fromAmount] = useFromAmount()
  const swapQuote = useSwapQuote()
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()

  const input = useMemo(() => {
    const amount = toChainAmount(
      shouldBePresent(fromAmount, 'swap from amount'),
      fromCoin.decimals
    )

    const receiver = getSwapDestinationAddress({ quote: swapQuote, fromCoin })

    const thirdPartyGasLimitEstimation = matchRecordUnion(swapQuote, {
      native: () => undefined,
      general: ({ tx }) =>
        matchRecordUnion(tx, {
          evm: ({ gasLimit }) => gasLimit,
          solana: () => undefined,
        }),
    })

    const hexPublicKey = isChainOfKind(fromCoin.chain, 'sui')
      ? Buffer.from(
          getPublicKey({
            chain: fromCoin.chain,
            walletCore,
            hexChainCode: vault.hexChainCode,
            publicKeys: vault.publicKeys,
          }).data()
        ).toString('hex')
      : undefined

    return {
      coin: fromCoin,
      amount,
      receiver,
      data: matchRecordUnion(swapQuote, {
        native: ({ memo }) => memo,
        general: ({ tx }) => getRecordUnionValue(tx).data,
      }),
      thirdPartyGasLimitEstimation,
      isComplexTx: isChainOfKind(fromCoin.chain, 'utxo') ? true : undefined,
      hexPublicKey,
    }
  }, [
    fromAmount,
    fromCoin,
    swapQuote,
    vault.hexChainCode,
    vault.publicKeys,
    walletCore,
  ])

  return useFeeQuoteQuery(input)
}
