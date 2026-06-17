import { TitleHeader } from '@core/ui/flow/TitleHeader'
import { VerifyKeysignStart } from '@core/ui/mpc/keysign/start/VerifyKeysignStart'
import { VerifyTransactionOverview } from '@core/ui/mpc/keysign/verify/VerifyTransactionOverview'
import { OnBackProp } from '@lib/ui/props'
import { Query } from '@lib/ui/query/Query'
import { Chain } from '@vultisig/core-chain/Chain'
import { CoinKey, CoinMetadata } from '@vultisig/core-chain/coin/Coin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { ReactNode } from 'react'

type VultStakingTxVerifyProps = OnBackProp & {
  title: string
  keysignPayloadQuery: Query<KeysignPayload>
  coin: CoinKey & Pick<CoinMetadata, 'decimals' | 'ticker' | 'logo'>
  amount: bigint
  senderName: string
  senderAddress: string
  receiver: string
  receiverVaultName?: string
  receiverAddressLabel?: string
  amountLabel?: string
  children?: ReactNode
}

/**
 * Single verify screen reused by every VULT staking action (approve, stake,
 * unstake, claim, cancel). Callers supply the action's keysign payload query and
 * the sender/receiver to display; everything is on Ethereum.
 */
export const VultStakingTxVerify = ({
  title,
  keysignPayloadQuery,
  coin,
  amount,
  senderName,
  senderAddress,
  receiver,
  receiverVaultName,
  receiverAddressLabel,
  amountLabel,
  onBack,
  children,
}: VultStakingTxVerifyProps) => (
  <>
    <TitleHeader title={title} onBack={onBack} />
    <VerifyKeysignStart keysignPayloadQuery={keysignPayloadQuery}>
      <VerifyTransactionOverview
        coin={coin}
        amount={amount}
        senderName={senderName}
        senderAddress={senderAddress}
        receiver={receiver}
        receiverVaultName={receiverVaultName}
        receiverAddressLabel={receiverAddressLabel}
        amountLabel={amountLabel}
        chain={Chain.Ethereum}
        keysignPayloadQuery={keysignPayloadQuery}
        getPayloadAmount={() => amount}
      />
      {children}
    </VerifyKeysignStart>
  </>
)
