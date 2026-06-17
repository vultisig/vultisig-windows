import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useCurrentVault,
  useCurrentVaultPublicKey,
} from '@core/ui/vault/state/currentVault'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { SwapQuote } from '@vultisig/core-chain/swap/quote/SwapQuote'
import {
  buildSwapKeysignPayload,
  BuildSwapKeysignPayloadInput,
} from '@vultisig/core-mpc/keysign/swap/build'
import { toKeysignLibType } from '@vultisig/core-mpc/types/utils/libType'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { omit } from '@vultisig/lib-utils/record/omit'
import { useMemo } from 'react'

import { useAdvancedSwapSettings } from '../state/advancedSettings'
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

  const [{ gasLimit }] = useAdvancedSwapSettings()
  const gasLimitOverride = gasLimit ? BigInt(gasLimit) : undefined

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
      gasLimitOverride,
    }),
    [
      fromAmount,
      fromCoin,
      fromPublicKey,
      gasLimitOverride,
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
      {
        ...omit(
          input,
          'walletCore',
          'fromPublicKey',
          'toPublicKey',
          'gasLimitOverride'
        ),
        gasLimitOverride: gasLimitOverride?.toString(),
      },
    ],
    queryFn: () => buildSwapKeysignPayload(input),
    ...noRefetchQueryOptions,
  })
}
