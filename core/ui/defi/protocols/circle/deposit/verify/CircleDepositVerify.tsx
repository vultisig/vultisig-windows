import { Chain } from '@core/chain/Chain'
import { usdc } from '@core/chain/coin/knownTokens'
import { TitleHeader } from '@core/ui/flow/TitleHeader'
import { VerifyKeysignStart } from '@core/ui/mpc/keysign/start/VerifyKeysignStart'
import { VerifyTransactionOverview } from '@core/ui/mpc/keysign/verify/VerifyTransactionOverview'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { OnBackProp, ValueProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { useCircleAccount } from '../../queries/circleAccount'
import { useCircleDepositKeysignPayloadQuery } from '../keysignPayload/useCircleDepositKeysignPayloadQuery'

type CircleDepositVerifyProps = ValueProp<bigint> & OnBackProp

export const CircleDepositVerify = ({
  value: amount,
  onBack,
}: CircleDepositVerifyProps) => {
  const { t } = useTranslation()
  const { name } = useCurrentVault()
  const senderAddress = useCurrentVaultAddress(Chain.Ethereum)
  const { address: receiver } = useCircleAccount()
  const keysignPayloadQuery = useCircleDepositKeysignPayloadQuery({ amount })

  return (
    <>
      <TitleHeader title={t('circle.verify_deposit')} onBack={onBack} />
      <VerifyKeysignStart keysignPayloadQuery={keysignPayloadQuery}>
        <VerifyTransactionOverview
          coin={usdc}
          amount={amount}
          senderName={name}
          senderAddress={senderAddress}
          receiver={receiver}
          chain={Chain.Ethereum}
          keysignPayloadQuery={keysignPayloadQuery}
        />
      </VerifyKeysignStart>
    </>
  )
}
