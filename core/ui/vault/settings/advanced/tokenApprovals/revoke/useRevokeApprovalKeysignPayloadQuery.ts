import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useCurrentVault,
  useCurrentVaultPublicKey,
} from '@core/ui/vault/state/currentVault'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { EvmChain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { buildSendKeysignPayload } from '@vultisig/core-mpc/keysign/send/build'
import { toKeysignLibType } from '@vultisig/core-mpc/types/utils/libType'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { omit } from '@vultisig/lib-utils/record/omit'
import { encodeFunctionData, erc20Abi, getAddress } from 'viem'

type UseRevokeApprovalKeysignPayloadQueryInput = {
  chain: EvmChain
  tokenAddress: string
  spender: string
}

/**
 * Keysign payload for `approve(spender, 0)` on the token contract: a
 * zero-value call from the native coin with the calldata in the memo, which
 * the EVM signer sends as transaction data.
 */
export const useRevokeApprovalKeysignPayloadQuery = ({
  chain,
  tokenAddress,
  spender,
}: UseRevokeApprovalKeysignPayloadQueryInput) => {
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const publicKey = useCurrentVaultPublicKey(chain)
  const address = useCurrentVaultAddress(chain)

  const input = {
    coin: { ...chainFeeCoin[chain], address },
    receiver: getAddress(tokenAddress),
    amount: 0n,
    memo: encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [getAddress(spender), 0n],
    }),
    vaultId: getVaultId(vault),
    localPartyId: vault.localPartyId,
    publicKey,
    libType: toKeysignLibType(vault),
    walletCore,
  }

  return useQuery({
    queryKey: [
      'revokeApprovalKeysignPayload',
      omit(input, 'walletCore', 'publicKey'),
    ],
    queryFn: () => buildSendKeysignPayload(input),
    ...noRefetchQueryOptions,
  })
}
