import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useCurrentVault,
  useCurrentVaultNullablePublicKey,
} from '@core/ui/vault/state/currentVault'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { FeeSettings } from '@vultisig/core-mpc/keysign/chainSpecific/FeeSettings'
import { BuildKeysignPayloadError } from '@vultisig/core-mpc/keysign/error'
import {
  buildSendKeysignPayload,
  BuildSendKeysignPayloadInput,
} from '@vultisig/core-mpc/keysign/send/build'
import { toKeysignLibType } from '@vultisig/core-mpc/types/utils/libType'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { omit } from '@vultisig/lib-utils/record/omit'
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
  const publicKey = useCurrentVaultNullablePublicKey(coin.chain)

  // @ts-expect-error — SDK gap: BuildSendKeysignPayloadInput omits hexPublicKeyOverride and requires non-null PublicKey; Windows supports MLDSA send
  const input: BuildSendKeysignPayloadInput = useMemo(
    () => ({
      coin,
      receiver,
      amount: shouldBePresent(amount),
      memo,
      vaultId: getVaultId(vault),
      localPartyId: vault.localPartyId,
      publicKey,
      libType: toKeysignLibType(vault),
      walletCore,
      feeSettings,
      hexPublicKeyOverride: publicKey ? undefined : vault.publicKeyMldsa,
    }),
    [amount, coin, feeSettings, memo, publicKey, receiver, vault, walletCore]
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
