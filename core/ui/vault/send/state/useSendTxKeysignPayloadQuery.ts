import { create } from '@bufbuild/protobuf'
import { isChainOfKind } from '@core/chain/ChainKind'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { getFeeQuote } from '@core/chain/feeQuote'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { buildChainSpecific } from '@core/mpc/keysign/chainSpecific/build'
import { refineKeysignAmount } from '@core/mpc/keysign/refine/amount'
import { refineKeysignUtxo } from '@core/mpc/keysign/refine/utxo'
import { getKeysignTxData } from '@core/mpc/keysign/txData'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useBalance } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useSendAmount } from './amount'
import { useSendMemo } from './memo'
import { useSendReceiver } from './receiver'
import { useCurrentSendCoin } from './sendCoin'

export const useSendTxKeysignPayloadQuery = () => {
  const coin = useCurrentSendCoin()
  const [receiver] = useSendReceiver()
  const [memo] = useSendMemo()
  const [amount] = useSendAmount()

  const vault = useCurrentVault()

  const balance = useBalance(extractAccountCoinKey(coin))

  const walletCore = useAssertWalletCore()

  const queryKey = useMemo(
    () => [
      'sendTxKeysignPayload',
      {
        coin,
        receiver,
        amount,
        memo,
        vaultHexChainCode: vault.hexChainCode,
        vaultLocalPartyId: vault.localPartyId,
        vaultLibType: vault.libType,
        vaultPublicKeys: vault.publicKeys,
      },
    ],
    [
      coin,
      receiver,
      amount,
      memo,
      vault.hexChainCode,
      vault.localPartyId,
      vault.libType,
      vault.publicKeys,
    ]
  )

  return useQuery({
    queryKey,
    queryFn: async () => {
      const txData = await getKeysignTxData({
        coin,
        amount: shouldBePresent(amount),
        receiver,
      })

      const feeQuote = await getFeeQuote({
        coin,
        receiver,
        amount: shouldBePresent(amount),
        data: memo,
      })

      const publicKey = getPublicKey({
        chain: coin.chain,
        walletCore,
        hexChainCode: vault.hexChainCode,
        publicKeys: vault.publicKeys,
      })

      const blockchainSpecific = buildChainSpecific({
        chain: coin.chain,
        txData,
        feeQuote,
      })

      const keysignPayload = create(KeysignPayloadSchema, {
        coin: toCommCoin({
          ...coin,
          hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
        }),
        toAddress: receiver,
        toAmount: shouldBePresent(amount).toString(),
        blockchainSpecific,
        memo,
        vaultLocalPartyId: vault.localPartyId,
        vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
        libType: vault.libType,
        utxoInfo: 'utxoInfo' in txData ? txData.utxoInfo : undefined,
      })

      const refiners = [refineKeysignAmount]

      if (isChainOfKind(coin.chain, 'utxo')) {
        refiners.push(refineKeysignUtxo)
      }

      return refiners.reduce(
        (keysignPayload, refiner) =>
          refiner({
            keysignPayload,
            walletCore,
            publicKey,
            balance: shouldBePresent(balance),
          }),
        keysignPayload
      )
    },
    ...noRefetchQueryOptions,
  })
}
