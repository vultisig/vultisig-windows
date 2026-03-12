import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { SwapQuote } from '@core/chain/swap/quote/SwapQuote'
import {
  buildSwapKeysignPayload,
  BuildSwapKeysignPayloadInput,
} from '@core/mpc/keysign/swap/build'
import { toKeysignLibType } from '@core/mpc/types/utils/libType'
import { getVaultId } from '@core/mpc/vault/Vault'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useCurrentVault,
  useCurrentVaultPublicKey,
} from '@core/ui/vault/state/currentVault'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { omit } from '@lib/utils/record/omit'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useFromAmount } from '../state/fromAmount'
import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'

export const useSwapKeysignPayloadQuery = (swapQuote: SwapQuote) => {
  const [fromCoinKey] = useSwapFromCoin()
  const [toCoinKey] = useSwapToCoin()
  const [fromAmount] = useFromAmount()
  const fromCoin = useCurrentVaultCoin(fromCoinKey)
  const toCoin = useCurrentVaultCoin(toCoinKey)
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const fromPublicKey = useCurrentVaultPublicKey(fromCoin.chain)
  const toPublicKey = useCurrentVaultPublicKey(toCoin.chain)

  const input: BuildSwapKeysignPayloadInput = useMemo(
    () => ({
      fromCoin,
      toCoin,
      amount: fromChainAmount(
        shouldBePresent(fromAmount, 'fromAmount'),
        fromCoin.decimals
      ),
      swapQuote,
      vaultId: getVaultId(vault),
      localPartyId: vault.localPartyId,
      fromPublicKey,
      toPublicKey,
      libType: toKeysignLibType(vault),
      walletCore,
    }),
    [
      fromAmount,
      fromCoin,
      fromPublicKey,
      swapQuote,
      toCoin,
      toPublicKey,
      vault,
      walletCore,
    ]
  )

  return useQuery({
    queryKey: [
      'swapKeysignPayload',
      omit(input, 'walletCore', 'fromPublicKey', 'toPublicKey'),
    ],
    queryFn: () => buildSwapKeysignPayload(input),
    ...noRefetchQueryOptions,
  })
}
