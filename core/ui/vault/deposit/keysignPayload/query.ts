import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useCurrentVault,
  useCurrentVaultNullablePublicKey,
} from '@core/ui/vault/state/currentVault'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { toKeysignLibType } from '@vultisig/core-mpc/types/utils/libType'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { omit } from '@vultisig/lib-utils/record/omit'
import { useMemo } from 'react'

import { solanaStakingActions } from '../ChainAction'
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

// A Solana blockhash lives ~60-90s; refresh well inside that so the value is
// still valid after the user's review + the MPC co-sign round.
const solanaBlockhashRefreshMs = 20_000

export const useDepositKeysignPayloadQuery = (
  options?: Pick<UseQueryOptions<KeysignPayload>, 'enabled'>
) => {
  const [action] = useDepositAction()
  const depositData = useDepositData()
  const [coin] = useDepositCoin()
  const vault = useCurrentVault()
  const publicKey = useCurrentVaultNullablePublicKey(coin.chain)
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
      hexPublicKeyOverride: publicKey ? undefined : vault.publicKeyMldsa,
      libType: toKeysignLibType(vault),
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

  // Solana native-staking bakes a `recentBlockHash` into the relayed, byte-parity
  // transaction bytes at build time. A Solana blockhash is only valid ~60-90s, so
  // freezing it (the default `noRefetchQueryOptions`) lets it expire while the user
  // reviews + co-signs, and the network then rejects the tx with the opaque
  // "Transaction simulation failed. Logs: []" (BlockhashNotFound). Keep it young by
  // rebuilding on a short interval while the verify screen is open, so at sign-time
  // the blockhash is at most `solanaBlockhashRefreshMs` old — well inside its
  // validity even after the co-sign round. Scoped to Solana staking; every other
  // action keeps the frozen payload.
  const isSolanaStaking = isOneOf(action, solanaStakingActions)
  const freshnessOptions = isSolanaStaking
    ? {
        staleTime: solanaBlockhashRefreshMs,
        refetchInterval: solanaBlockhashRefreshMs,
        refetchIntervalInBackground: false,
      }
    : noRefetchQueryOptions

  return useQuery<KeysignPayload>({
    queryKey: ['depositKeysignPayload', omit(input, 'publicKey', 'walletCore')],
    queryFn: () => buildDepositKeysignPayload(input),
    ...freshnessOptions,
    ...options,
  })
}
