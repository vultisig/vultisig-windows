import { create } from '@bufbuild/protobuf'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useStateDependentQuery } from '@lib/ui/query/hooks/useStateDependentQuery'

import { processKeysignPayload } from '../../../chain/keysign/processKeysignPayload'
import { toHexPublicKey } from '../../../chain/utils/toHexPublicKey'
import { useVaultPublicKeyQuery } from '../../publicKey/queries/useVaultPublicKeyQuery'
import { useCurrentVault, useCurrentVaultCoin } from '../../state/currentVault'
import { useSendCappedAmountQuery } from '../queries/useSendCappedAmountQuery'
import { useSendChainSpecificQuery } from '../queries/useSendChainSpecificQuery'
import { useSendMemo } from './memo'
import { useSendReceiver } from './receiver'
import { useCurrentSendCoin } from './sendCoin'

export const useSendTxKeysignPayloadQuery = () => {
  const [coinKey] = useCurrentSendCoin()
  const coin = useCurrentVaultCoin(coinKey)
  const [receiver] = useSendReceiver()
  const [memo] = useSendMemo()

  const vault = useCurrentVault()

  const chainSpecificQuery = useSendChainSpecificQuery()

  const cappedAmountQuery = useSendCappedAmountQuery()

  const publicKeyQuery = useVaultPublicKeyQuery(coin.chain)

  const walletCore = useAssertWalletCore()

  return useStateDependentQuery({
    state: {
      chainSpecific: chainSpecificQuery.data,
      cappedAmount: cappedAmountQuery.data,
      publicKey: publicKeyQuery.data,
    },
    getQuery: ({ chainSpecific, cappedAmount, publicKey }) => ({
      queryKey: ['sendKeysignPayload'],
      queryFn: async () => {
        return processKeysignPayload(
          create(KeysignPayloadSchema, {
            coin: toCommCoin({
              ...coin,
              hexPublicKey: toHexPublicKey({
                publicKey,
                walletCore,
              }),
            }),
            toAddress: receiver,
            toAmount: cappedAmount.amount.toString(),
            blockchainSpecific: chainSpecific,
            memo,
            vaultLocalPartyId: vault.local_party_id,
            vaultPublicKeyEcdsa: vault.public_key_ecdsa,
          })
        )
      },
    }),
  })
}
