import { create } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { buildChainSpecific } from '@core/mpc/keysign/chainSpecific/build'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'

import { useCurrentVault } from '../../../state/currentVault'
import { useReferralCoin } from '../hooks/useReferralCoin'
import { useReferralFeeQuoteQuery } from './useReferralFeeQuoteQuery'
import { useReferralKeysignTxDataQuery } from './useReferralKeysignTxDataQuery'

export const useReferralKeysignPayloadQuery = ({
  memo,
  amount,
}: {
  memo: string
  amount: number
}) => {
  const vault = useCurrentVault()
  const coin = useReferralCoin()
  const walletCore = useAssertWalletCore()
  const publicKey = getPublicKey({
    chain: coin.chain,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
  })

  const feeQuote = useReferralFeeQuoteQuery()
  const txData = useReferralKeysignTxDataQuery()

  return useTransformQueriesData(
    {
      feeQuote,
      txData,
    },
    ({ feeQuote, txData }) => {
      const blockchainSpecific = buildChainSpecific({
        chain: coin.chain,
        txData,
        feeQuote,
      })
      return create(KeysignPayloadSchema, {
        coin: toCommCoin({
          ...coin,
          hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
        }),
        memo,
        toAmount: toChainAmount(amount, coin.decimals).toString(),
        blockchainSpecific,
        utxoInfo: 'utxoInfo' in txData ? txData.utxoInfo : undefined,
        vaultLocalPartyId: vault.localPartyId,
        vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
        libType: vault.libType,
      })
    }
  )
}
