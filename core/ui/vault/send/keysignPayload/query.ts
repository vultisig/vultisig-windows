import { FeeSettings } from '@core/mpc/keysign/chainSpecific/FeeSettings'
import { BuildKeysignPayloadError } from '@core/mpc/keysign/error'
import {
  buildSendKeysignPayload,
  BuildSendKeysignPayloadInput,
} from '@core/mpc/keysign/send/build'
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
  const publicKey = useCurrentVaultPublicKey(coin.chain)

  const input: BuildSendKeysignPayloadInput = useMemo(
    () => ({
      coin,
      receiver,
      amount: shouldBePresent(amount),
      memo,
      vaultId: getVaultId(vault),
      localPartyId: vault.localPartyId,
      publicKey,
      libType: vault.libType,
      walletCore,
      feeSettings,
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
