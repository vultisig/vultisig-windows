import { Chain } from '@core/chain/Chain'
import { usdc } from '@core/chain/coin/knownTokens'
import { TitleHeader } from '@core/ui/flow/TitleHeader'
import { VerifyKeysignStart } from '@core/ui/mpc/keysign/start/VerifyKeysignStart'
import { VerifyTransactionOverview } from '@core/ui/mpc/keysign/verify/VerifyTransactionOverview'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { OnBackProp, ValueProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { circleName } from '../../core/config'
import { useCircleAccount } from '../../queries/circleAccount'
import { useCircleWithdrawKeysignPayloadQuery } from '../keysignPayload/useCircleWithdrawKeysignPayloadQuery'

type CircleWithdrawVerifyProps = ValueProp<bigint> & OnBackProp

export const CircleWithdrawVerify = ({
  value: amount,
  onBack,
}: CircleWithdrawVerifyProps) => {
  const { t } = useTranslation()
  const vaultAddress = useCurrentVaultAddress(Chain.Ethereum)
  const { address: senderAddress } = useCircleAccount()
  const keysignPayloadQuery = useCircleWithdrawKeysignPayloadQuery({ amount })

  return (
    <>
      <TitleHeader title={t('circle.verify_withdraw')} onBack={onBack} />
      <VerifyKeysignStart keysignPayloadQuery={keysignPayloadQuery}>
        <VerifyTransactionOverview
          coin={usdc}
          amount={amount}
          senderName={circleName}
          senderAddress={senderAddress}
          receiver={vaultAddress}
          chain={Chain.Ethereum}
          keysignPayloadQuery={keysignPayloadQuery}
        />
      </VerifyKeysignStart>
    </>
  )
}
