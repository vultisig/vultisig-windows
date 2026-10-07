import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useCurrentVault,
  useCurrentVaultNullablePublicKey,
} from '@core/ui/vault/state/currentVault'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { FeeSettings } from '@vultisig/core-mpc/keysign/chainSpecific/FeeSettings'
import { BuildKeysignPayloadError } from '@vultisig/core-mpc/keysign/error'
import { toKeysignLibType } from '@vultisig/core-mpc/types/utils/libType'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { omit } from '@vultisig/lib-utils/record/omit'

import { getSendFeeEstimateWithTronMemo } from '../../../mpc/keysign/fee/tronMemoFee'
import { useSendAllowDeath } from '../allowDeath/useSendAllowDeath'
import { useTonGaslessSend } from '../fee/tonGasless/useTonGaslessSend'
import { getSendPayloadMemo } from '../memo/sendMemoSupport'
import { useSendDestinationTag } from '../state/destinationTag'
import { useSendMemo } from '../state/memo'
import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'
import { useSendBalanceQuery } from './useSendBalanceQuery'

type UseSendFeeEstimateQueryProps = {
  /** Fee settings chosen on Verify. Without them the default fee is estimated. */
  feeSettings?: FeeSettings
}

/**
 * The network fee of sending the whole balance to the current receiver with
 * the current memo, which the form reserves out of the amount.
 */
export const useSendFeeEstimateQuery = ({
  feeSettings,
}: UseSendFeeEstimateQueryProps = {}) => {
  const coin = useCurrentSendCoin()
  const [receiver] = useSendReceiver()
  const [memo] = useSendMemo()
  const { destinationTag } = useSendDestinationTag()
  const { isEnabled: tonGasless } = useTonGaslessSend()
  // Priced for the call actually signed: an account-emptying send signs
  // transfer_allow_death, not the keep-alive transfer.
  const { isEnabled: allowDeath } = useSendAllowDeath()

  const balanceQuery = useSendBalanceQuery(extractAccountCoinKey(coin))
  const balance = balanceQuery.data

  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const publicKey = useCurrentVaultNullablePublicKey(coin.chain)

  const input =
    balance == null
      ? null
      : {
          coin,
          receiver,
          amount: balance,
          destinationTag,
          memo: getSendPayloadMemo({ chain: coin.chain, memo }),
          vaultId: getVaultId(vault),
          localPartyId: vault.localPartyId,
          publicKey,
          libType: toKeysignLibType(vault),
          walletCore,
          hexPublicKeyOverride: publicKey ? undefined : vault.publicKeyMldsa,
          tonGasless,
          allowDeath,
          feeSettings,
        }

  return useQuery({
    queryKey: [
      'sendFeeEstimate',
      input ? omit(input, 'walletCore', 'publicKey') : null,
    ],
    queryFn: () => getSendFeeEstimateWithTronMemo(input!),
    enabled: !!receiver && balance != null && input != null,
    placeholderData: keepPreviousData,
    ...noRefetchQueryOptions,
    retry: (failureCount, error) => {
      if (error instanceof BuildKeysignPayloadError) {
        return false
      }

      return failureCount < 3
    },
  })
}
