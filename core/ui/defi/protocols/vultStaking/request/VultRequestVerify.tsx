import { useVaultNameForAddress } from '@core/ui/vault/hooks/useVaultNameForAddress'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { Chain } from '@vultisig/core-chain/Chain'
import { useTranslation } from 'react-i18next'

import {
  sVultAddress,
  sVultCoin,
  vultCoin,
  vultStakingName,
} from '../core/config'
import { PendingUnstake } from '../core/getPendingUnstakes'
import {
  useVultCancelUnstakeKeysignPayloadQuery,
  useVultClaimKeysignPayloadQuery,
} from '../keysign/keysignPayloadQueries'
import { useVultStakingViewState } from '../state/vultStakingViewState'
import { VultStakingTxVerify } from '../verify/VultStakingTxVerify'

type VultRequestVerifyProps = {
  request: PendingUnstake
  mode: 'claim' | 'cancel'
}

/**
 * Verify screen for acting on a pending unstake request. Both claim and cancel
 * send the underlying back to the vault and differ only by which contract call
 * is signed, so they share one screen (only the active query runs).
 */
export const VultRequestVerify = ({
  request,
  mode,
}: VultRequestVerifyProps) => {
  const { t } = useTranslation()
  const [, setViewState] = useVultStakingViewState()
  const vaultAddress = useCurrentVaultAddress(Chain.Ethereum)

  const claimQuery = useVultClaimKeysignPayloadQuery(
    request.requestId,
    mode === 'claim'
  )
  const cancelQuery = useVultCancelUnstakeKeysignPayloadQuery(
    request.requestId,
    mode === 'cancel'
  )
  const receiverVaultName = useVaultNameForAddress({
    address: vaultAddress,
    chain: Chain.Ethereum,
  })

  return (
    <VultStakingTxVerify
      title={
        mode === 'claim'
          ? t('vultStaking.claim')
          : t('vultStaking.cancel_unstake')
      }
      keysignPayloadQuery={mode === 'claim' ? claimQuery : cancelQuery}
      coin={mode === 'claim' ? vultCoin : sVultCoin}
      amount={request.amount}
      amountLabel={
        mode === 'claim'
          ? t('vultStaking.youre_claiming')
          : t('vultStaking.youre_cancelling')
      }
      senderName={vultStakingName}
      senderAddress={sVultAddress}
      receiver={vaultAddress}
      receiverVaultName={receiverVaultName ?? undefined}
      onBack={() => setViewState({ type: 'home' })}
    />
  )
}
