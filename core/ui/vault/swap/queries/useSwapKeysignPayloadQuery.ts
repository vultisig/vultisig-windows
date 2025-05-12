import { create } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { getSwapKeysignPayloadFields } from '@core/chain/swap/keysign/getSwapKeysignPayloadFields'
import { toHexPublicKey } from '@core/chain/utils/toHexPublicKey'
import { processKeysignPayload } from '@core/mpc/keysign/keysignPayload/processKeysignPayload'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useStateDependentQuery } from '@lib/ui/query/hooks/useStateDependentQuery'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useFromAmount } from '../state/fromAmount'
import { useToCoin } from '../state/toCoin'
import { useSwapChainSpecificQuery } from './useSwapChainSpecificQuery'
import { useSwapQuoteQuery } from './useSwapQuoteQuery'

export const useSwapKeysignPayloadQuery = () => {
  const [{ coin: fromCoinKey }] = useCoreViewState<'swap'>()
  const fromCoin = useCurrentVaultCoin(fromCoinKey)

  const [toCoinKey] = useToCoin()
  const toCoin = useCurrentVaultCoin(toCoinKey)

  const [fromAmount] = useFromAmount()

  const swapQuoteQuery = useSwapQuoteQuery()

  const vault = useCurrentVault()

  const chainSpecificQuery = useSwapChainSpecificQuery()

  const walletCore = useAssertWalletCore()

  return useStateDependentQuery({
    state: {
      swapQuote: swapQuoteQuery.data,
      chainSpecific: chainSpecificQuery.data,
      fromAmount: fromAmount ?? undefined,
    },
    getQuery: ({ swapQuote, chainSpecific, fromAmount }) => ({
      queryKey: ['swapKeysignPayload'],
      queryFn: async () => {
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

        const amount = toChainAmount(fromAmount, fromCoin.decimals)

        const fromCoinHexPublicKey = toHexPublicKey({
          publicKey: fromPublicKey,
          walletCore,
        })

        const toCoinHexPublicKey = toHexPublicKey({
          publicKey: toPublicKey,
          walletCore,
        })

        const swapSpecificFields = getSwapKeysignPayloadFields({
          amount,
          quote: swapQuote,
          fromCoin: {
            ...fromCoin,
            hexPublicKey: fromCoinHexPublicKey,
          },
          toCoin: {
            ...toCoin,
            hexPublicKey: toCoinHexPublicKey,
          },
        })

        const result = create(KeysignPayloadSchema, {
          coin: toCommCoin({
            ...fromCoin,
            hexPublicKey: fromCoinHexPublicKey,
          }),
          toAmount: amount.toString(),
          blockchainSpecific: chainSpecific,
          vaultLocalPartyId: vault.localPartyId,
          vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
          ...swapSpecificFields,
        })

        return processKeysignPayload(result)
      },
    }),
  })
}
