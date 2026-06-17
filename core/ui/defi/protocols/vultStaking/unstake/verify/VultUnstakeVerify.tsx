import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { OnBackProp, ValueProp } from '@lib/ui/props'
import { Chain } from '@vultisig/core-chain/Chain'
import { useTranslation } from 'react-i18next'

import { sVultAddress, vultCoin, vultStakingName } from '../../core/config'
import { useVultUnstakeKeysignPayloadQuery } from '../../keysign/keysignPayloadQueries'
import { VultStakingTxVerify } from '../../verify/VultStakingTxVerify'

type VultUnstakeVerifyProps = ValueProp<bigint> & OnBackProp

export const VultUnstakeVerify = ({
  value: amount,
  onBack,
}: VultUnstakeVerifyProps) => {
  const { t } = useTranslation()
  const vaultAddress = useCurrentVaultAddress(Chain.Ethereum)
  const vault = useCurrentVault()
  const keysignPayloadQuery = useVultUnstakeKeysignPayloadQuery(amount)

  return (
    <VultStakingTxVerify
      title={t('vultStaking.verify_unstake')}
      keysignPayloadQuery={keysignPayloadQuery}
      coin={vultCoin}
      amount={amount}
      amountLabel={t('vultStaking.youre_unstaking')}
      senderName={vault.name}
      senderAddress={vaultAddress}
      receiver={sVultAddress}
      receiverAddressLabel={vultStakingName}
      onBack={onBack}
    />
  )
}
