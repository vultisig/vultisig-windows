import { create } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { getSwapKeysignPayloadFields } from '@core/chain/swap/keysign/getSwapKeysignPayloadFields'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { pick } from '@lib/utils/record/pick'

import { useErc20ApprovePayloadQuery } from '../../../mpc/keysign/evm/queries/erc20ApprovePayload'
import { useKeysignUtxoInfo } from '../../../mpc/keysign/utxo/queries/keysignUtxoInfo'
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

  const amount = toChainAmount(shouldBePresent(fromAmount), fromCoin.decimals)

  const erc20ApprovePayloadQuery = useErc20ApprovePayloadQuery({
    chain: fromCoin.chain,
    address: fromCoin.address,
    id: fromCoin.id,
    spender: toCoin.address,
    amount,
  })

  const utxoInfo = useKeysignUtxoInfo(pick(fromCoin, ['chain', 'address']))

  const walletCore = useAssertWalletCore()

  return useTransformQueriesData(
    {
      swapQuote: swapQuoteQuery,
      chainSpecific: chainSpecificQuery,
      erc20ApprovePayload: erc20ApprovePayloadQuery,
      utxoInfo,
    },
    ({ swapQuote, chainSpecific, utxoInfo, erc20ApprovePayload }) => {
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

      const fromCoinHexPublicKey = Buffer.from(fromPublicKey.data()).toString(
        'hex'
      )

      const toCoinHexPublicKey = Buffer.from(toPublicKey.data()).toString('hex')

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

      return create(KeysignPayloadSchema, {
        coin: toCommCoin({
          ...fromCoin,
          hexPublicKey: fromCoinHexPublicKey,
        }),
        toAmount: amount.toString(),
        blockchainSpecific: chainSpecific,
        vaultLocalPartyId: vault.localPartyId,
        vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
        libType: vault.libType,
        erc20ApprovePayload: erc20ApprovePayload ?? undefined,
        utxoInfo: utxoInfo ?? undefined,
        ...swapSpecificFields,
      })
    }
  )
}
