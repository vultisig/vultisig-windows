import { create } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { useChainSpecificQuery } from '../../../../chain/coin/queries/useChainSpecificQuery'
import { useCurrentVault } from '../../../state/currentVault'

export const useReferralKeysignPayload = ({
  coin,
  memo,
  amount,
}: {
  coin: AccountCoin
  memo: string
  amount: number
}) => {
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const publicKey = getPublicKey({
    chain: coin.chain,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
  })

  const chainSpecificQuery = useChainSpecificQuery({
    coin,
    isDeposit: true,
  })

  if (chainSpecificQuery.isLoading || !chainSpecificQuery.data) {
    return { keysignPayload: null }
  }

  const keysignPayload = create(KeysignPayloadSchema, {
    coin: toCommCoin({
      ...coin,
      hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
    }),
    memo,
    toAmount: toChainAmount(amount, coin.decimals).toString(),
    blockchainSpecific: shouldBePresent(chainSpecificQuery.data),
    vaultLocalPartyId: vault.localPartyId,
    vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
    libType: vault.libType,
  })

  return { keysignPayload }
}
