import { Chain } from '@core/chain/Chain'
import { encodeMoneroPublicKeyHex } from '@core/chain/chains/monero/moneroPublicKey'
import { FeeSettings } from '@core/mpc/keysign/chainSpecific/FeeSettings'
import { BuildKeysignPayloadError } from '@core/mpc/keysign/error'
import {
  buildSendKeysignPayload,
  BuildSendKeysignPayloadInput,
} from '@core/mpc/keysign/send/build'
import { toKeysignLibType } from '@core/mpc/types/utils/libType'
import { getVaultId } from '@core/mpc/vault/Vault'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useCurrentVault,
  useCurrentVaultPublicKey,
} from '@core/ui/vault/state/currentVault'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { omit } from '@lib/utils/record/omit'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useSendAmount } from '../state/amount'
import { useSendMemo } from '../state/memo'
import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'

type UseSendKeysignPayloadQueryProps = {
  feeSettings?: FeeSettings
}

export const useSendKeysignPayloadQuery = ({
  feeSettings,
}: UseSendKeysignPayloadQueryProps = {}) => {
  const coin = useCurrentSendCoin()
  const [receiver] = useSendReceiver()
  const [memo] = useSendMemo()
  const [amount] = useSendAmount()

  const vault = useCurrentVault()

  const walletCore = useAssertWalletCore()

  const isMonero = coin.chain === Chain.Monero
  const publicKey = useCurrentVaultPublicKey(
    isMonero ? Chain.THORChain : coin.chain
  )

  const hexPublicKeyOverride = isMonero
    ? encodeMoneroPublicKeyHex(
        vault.chainPublicKeys?.[Chain.Monero] ?? vault.publicKeys.eddsa
      )
    : undefined

  const input: BuildSendKeysignPayloadInput = useMemo(
    () => ({
      coin,
      receiver,
      amount: shouldBePresent(amount),
      memo,
      vaultId: getVaultId(vault),
      localPartyId: vault.localPartyId,
      publicKey: isMonero ? null : publicKey,
      libType: toKeysignLibType(vault),
      walletCore,
      feeSettings,
      hexPublicKeyOverride,
    }),
    [
      amount,
      coin,
      feeSettings,
      hexPublicKeyOverride,
      isMonero,
      memo,
      publicKey,
      receiver,
      vault,
      walletCore,
    ]
  )

  return useQuery({
    queryKey: ['sendTxKeysignPayload', omit(input, 'walletCore', 'publicKey')],
    queryFn: () => buildSendKeysignPayload(input),
    ...noRefetchQueryOptions,
    retry: (failureCount, error) => {
      if (error instanceof BuildKeysignPayloadError) {
        return false
      }

      return failureCount < 3
    },
  })
}
