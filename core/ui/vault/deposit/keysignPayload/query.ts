import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { getVaultId } from '@core/mpc/vault/Vault'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useCurrentVault,
  useCurrentVaultPublicKey,
} from '@core/ui/vault/state/currentVault'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { omit } from '@lib/utils/record/omit'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useDepositMemo } from '../hooks/useDepositMemo'
import { useDepositReceiver } from '../hooks/useDepositReceiver'
import { useDepositTxType } from '../hooks/useDepositTxType'
import { useDepositAction } from '../providers/DepositActionProvider'
import { useDepositCoin } from '../providers/DepositCoinProvider'
import { useDepositData } from '../state/data'
import {
  buildDepositKeysignPayload,
  BuildDepositKeysignPayloadInput,
} from './build'

export const useDepositKeysignPayloadQuery = (
  options?: Pick<UseQueryOptions<KeysignPayload>, 'enabled'>
) => {
  const [action] = useDepositAction()
  const depositData = useDepositData()
  const [coin] = useDepositCoin()
  const vault = useCurrentVault()
  const publicKey = useCurrentVaultPublicKey(coin.chain)
  const walletCore = useAssertWalletCore()

  const receiver = useDepositReceiver()
  const transactionType = useDepositTxType()

  const memo = useDepositMemo()

  const hasAmount = 'amount' in depositData
  const amount = hasAmount ? Number(depositData['amount']) : undefined
  const slippage = Number(depositData['slippage'] ?? 0)
  const validatorAddress = depositData['validatorAddress'] as string | undefined
  const autocompound = Boolean(depositData['autoCompound'])

  const input: BuildDepositKeysignPayloadInput = useMemo(
    () => ({
      coin,
      action,
      depositData,
      receiver,
      amount:
        amount !== undefined && Number.isFinite(amount) ? amount : undefined,
      memo,
      validatorAddress,
      slippage,
      autocompound,
      transactionType: transactionType ?? undefined,
      vaultId: getVaultId(vault),
      localPartyId: vault.localPartyId,
      publicKey,
      libType: vault.libType,
      walletCore,
    }),
    [
      action,
      amount,
      autocompound,
      coin,
      walletCore,
      depositData,
      memo,
      publicKey,
      receiver,
      slippage,
      transactionType,
      validatorAddress,
      vault,
    ]
  )

  return useQuery<KeysignPayload>({
    queryKey: ['depositKeysignPayload', omit(input, 'publicKey', 'walletCore')],
    queryFn: () => buildDepositKeysignPayload(input),
    ...noRefetchQueryOptions,
    ...options,
  })
}
