import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { OnBackProp, ValueProp } from '@lib/ui/props'
import { Chain } from '@vultisig/core-chain/Chain'
import { useTranslation } from 'react-i18next'

import { sVultAddress, vultCoin, vultStakingName } from '../../core/config'
import { useVultStakeKeysignPayloadQuery } from '../../keysign/keysignPayloadQueries'
import { VultStakingTxVerify } from '../../verify/VultStakingTxVerify'

type VultStakeVerifyProps = ValueProp<bigint> & OnBackProp

/**
 * Stake confirmation. The keysign payload prepends a VULT→sVULT approval when the
 * allowance is insufficient, so approve + depositFor are signed in one ceremony
 * and broadcast back-to-back — no separate approve screen.
 */
export const VultStakeVerify = ({
  value: amount,
  onBack,
}: VultStakeVerifyProps) => {
  const { t } = useTranslation()
  const vaultAddress = useCurrentVaultAddress(Chain.Ethereum)
  const vault = useCurrentVault()
  const keysignPayloadQuery = useVultStakeKeysignPayloadQuery(amount)

  return (
    <VultStakingTxVerify
      title={t('vultStaking.verify_stake')}
      keysignPayloadQuery={keysignPayloadQuery}
      coin={vultCoin}
      amount={amount}
      senderName={vault.name}
      senderAddress={vaultAddress}
      receiver={sVultAddress}
      receiverAddressLabel={vultStakingName}
      onBack={onBack}
    />
  )
}
