import { create } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useStateDependentQuery } from '@lib/ui/query/hooks/useStateDependentQuery'

import { processKeysignPayload } from '../../../chain/keysign/processKeysignPayload'
import { getSwapKeysignPayloadFields } from '../../../chain/swap/keysign/getSwapKeysignPayloadFields'
import { toHexPublicKey } from '../../../chain/utils/toHexPublicKey'
import { useVaultPublicKeyQuery } from '../../publicKey/queries/useVaultPublicKeyQuery'
import { useCurrentVault } from '../../state/currentVault'
import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { useFromAmount } from '../state/fromAmount'
import { useFromCoin } from '../state/fromCoin'
import { useToCoin } from '../state/toCoin'
import { useSwapChainSpecificQuery } from './useSwapChainSpecificQuery'
import { useSwapQuoteQuery } from './useSwapQuoteQuery'

export const useSwapKeysignPayloadQuery = () => {
  const [fromCoinKey] = useFromCoin()
  const fromCoin = useCurrentVaultCoin(fromCoinKey)

  const [toCoinKey] = useToCoin()
  const toCoin = useCurrentVaultCoin(toCoinKey)

  const [fromAmount] = useFromAmount()

  const swapQuoteQuery = useSwapQuoteQuery()

  const vault = useCurrentVault()

  const chainSpecificQuery = useSwapChainSpecificQuery()

  const fromCoinPublicKeyQuery = useVaultPublicKeyQuery(fromCoin.chain)
  const toCoinPublicKeyQuery = useVaultPublicKeyQuery(toCoin.chain)

  const walletCore = useAssertWalletCore()

  return useStateDependentQuery({
    state: {
      swapQuote: swapQuoteQuery.data,
      chainSpecific: chainSpecificQuery.data,
      fromAmount: fromAmount ?? undefined,
      fromPublicKey: fromCoinPublicKeyQuery.data,
      toPublicKey: toCoinPublicKeyQuery.data,
    },
    getQuery: ({
      swapQuote,
      chainSpecific,
      fromAmount,
      fromPublicKey,
      toPublicKey,
    }) => ({
      queryKey: ['swapKeysignPayload'],
      queryFn: async () => {
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
