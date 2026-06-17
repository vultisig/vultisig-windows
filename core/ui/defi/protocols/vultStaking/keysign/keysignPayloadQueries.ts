import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import {
  buildVultCancelUnstakeKeysignPayload,
  buildVultClaimKeysignPayload,
  buildVultStakeKeysignPayload,
  buildVultUnstakeKeysignPayload,
} from '@vultisig/core-mpc/keysign/vultStaking/build'
import { omit } from '@vultisig/lib-utils/record/omit'

import { sVultAddress, vultCoin } from '../core/config'
import {
  keysignPayloadRetry,
  useVultStakingKeysignBase,
} from './useVultStakingKeysignBase'

const serializableInput = <
  T extends { walletCore: unknown; publicKey: unknown },
>(
  input: T
) => omit(input, 'walletCore', 'publicKey')

/**
 * `sVULT.depositFor(vault, amount)`, with `VULT.approve(sVULT, amount)` prepended
 * by the builder when allowance is insufficient — signed and broadcast together.
 */
export const useVultStakeKeysignPayloadQuery = (amount: bigint) => {
  const base = useVultStakingKeysignBase()
  const input = {
    ...base,
    underlyingToken: vultCoin,
    stakingContractAddress: sVultAddress,
    amount,
  }

  return useQuery({
    queryKey: ['vultStakeKeysignPayload', serializableInput(input)],
    queryFn: () => buildVultStakeKeysignPayload(input),
    ...noRefetchQueryOptions,
    retry: keysignPayloadRetry,
  })
}

/** `sVULT.requestUnstake(amount)`. */
export const useVultUnstakeKeysignPayloadQuery = (amount: bigint) => {
  const base = useVultStakingKeysignBase()
  const input = { ...base, stakingContractAddress: sVultAddress, amount }

  return useQuery({
    queryKey: ['vultUnstakeKeysignPayload', serializableInput(input)],
    queryFn: () => buildVultUnstakeKeysignPayload(input),
    ...noRefetchQueryOptions,
    retry: keysignPayloadRetry,
  })
}

/** `sVULT.claim(requestId, vault)`. */
export const useVultClaimKeysignPayloadQuery = (
  requestId: bigint,
  enabled = true
) => {
  const base = useVultStakingKeysignBase()
  const input = { ...base, stakingContractAddress: sVultAddress, requestId }

  return useQuery({
    queryKey: ['vultClaimKeysignPayload', serializableInput(input)],
    queryFn: () => buildVultClaimKeysignPayload(input),
    enabled,
    ...noRefetchQueryOptions,
    retry: keysignPayloadRetry,
  })
}

/** `sVULT.cancelUnstake(requestId)`. */
export const useVultCancelUnstakeKeysignPayloadQuery = (
  requestId: bigint,
  enabled = true
) => {
  const base = useVultStakingKeysignBase()
  const input = { ...base, stakingContractAddress: sVultAddress, requestId }

  return useQuery({
    queryKey: ['vultCancelUnstakeKeysignPayload', serializableInput(input)],
    queryFn: () => buildVultCancelUnstakeKeysignPayload(input),
    enabled,
    ...noRefetchQueryOptions,
    retry: keysignPayloadRetry,
  })
}
