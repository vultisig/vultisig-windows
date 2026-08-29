import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import {
  decodedAmountCanBeShown,
  decodeSignedTransaction,
  SignedTransactionDecoderContext,
} from '@core/ui/mpc/keysign/transaction-decoding/decodeSignedTransaction'
import { getVerifyTransactionTitleKey } from '@core/ui/mpc/keysign/transaction-decoding/presentation'
import { KeysignFeeAmount } from '@core/ui/mpc/keysign/tx/FeeAmount'
import {
  TransactionOverviewAddress,
  TransactionOverviewAmount,
  TransactionOverviewItem,
} from '@core/ui/mpc/keysign/verify/components'
import { borderRadiusPx } from '@lib/ui/css/borderRadius'
import { HStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Query } from '@lib/ui/query/Query'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { CoinKey, CoinMetadata } from '@vultisig/core-chain/coin/Coin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

type VerifyCoin = CoinKey & Pick<CoinMetadata, 'decimals' | 'ticker' | 'logo'>

type VerifyTransactionOverviewProps = {
  coin: VerifyCoin
  amount: bigint
  senderName: string
  senderAddress: string
  receiver: string | ReactNode
  /**
   * Optional vault name for the receiver. When provided and receiver is a string address,
   * displays "VaultName (addr...addr)" format instead of plain truncated address.
   * Wired in Send and Circle withdraw flows (receiver is a user vault).
   * Swap flows intentionally omit this — their receivers are protocol/contract addresses, not user vaults.
   */
  receiverVaultName?: string
  /**
   * Optional address book contact name for the receiver. Used when the receiver is not a known
   * vault but is saved in the address book.
   * Priority: vault name > address book name > address label > raw address.
   */
  receiverAddressBookName?: string
  /**
   * Optional human-readable label for the receiver address resolved from a name service
   * (ENS, SNS, TNS, etc.) or other source. Displayed as "label (0xd8dA...6045)".
   * Priority: vault name > address book name > address label > raw address.
   */
  receiverAddressLabel?: string
  chain: Chain
  /**
   * Heading above the amount. Defaults to "You're sending"; operations that are
   * not a plain transfer (e.g. a TRON freeze) name themselves instead, so both
   * devices in a keysign session frame the transaction the same way.
   */
  amountLabel?: ReactNode
  keysignPayloadQuery: Query<KeysignPayload>
  /**
   * Overrides how the signed amount is read from the payload. Wasm contract
   * executes leave `toAmount` empty and carry the amount in `contractPayload`,
   * so the caller supplies a reader that derives it from the signed payload.
   */
  getPayloadAmount?: (payload: KeysignPayload) => bigint | number | string
  decoderContext?: SignedTransactionDecoderContext
  renderFeeExtra?: (keysignPayload: KeysignPayload) => ReactNode
  children?: ReactNode
}

export const VerifyTransactionOverview = ({
  coin,
  amount,
  senderName,
  senderAddress,
  receiver,
  receiverVaultName,
  receiverAddressBookName,
  receiverAddressLabel,
  chain,
  amountLabel,
  keysignPayloadQuery,
  getPayloadAmount,
  decoderContext,
  renderFeeExtra,
  children,
}: VerifyTransactionOverviewProps) => {
  const { t } = useTranslation()
  const formattedAmount = fromChainAmount(amount, coin.decimals)
  const fallbackAmountLabel = amountLabel ?? t('you_are_sending')
  const resolvedAmountLabel = amountLabel ?? (
    <MatchQuery
      value={keysignPayloadQuery}
      pending={() => fallbackAmountLabel}
      error={() => fallbackAmountLabel}
      success={payload => {
        const titleKey = getVerifyTransactionTitleKey(
          decodeSignedTransaction(payload, decoderContext).operation
        )
        return titleKey ? t(titleKey) : fallbackAmountLabel
      }}
    />
  )

  const receiverName =
    receiverVaultName ?? receiverAddressBookName ?? receiverAddressLabel

  return (
    <List border="gradient" radius={borderRadiusPx.lg}>
      <TransactionOverviewAmount
        label={resolvedAmountLabel}
        coin={coin}
        fallbackAmount={formattedAmount}
        keysignPayloadQuery={keysignPayloadQuery}
        getPayloadAmount={getPayloadAmount}
        hidePayloadAmount={payload => {
          const result = decodeSignedTransaction(payload, decoderContext)
          return (
            getVerifyTransactionTitleKey(result.operation) !== undefined &&
            getPayloadAmount === undefined &&
            !decodedAmountCanBeShown(result.amount)
          )
        }}
      />
      <TransactionOverviewAddress
        label={t('from')}
        address={senderAddress}
        name={senderName}
      />
      {typeof receiver === 'string' ? (
        <TransactionOverviewAddress
          label={t('to')}
          address={receiver}
          name={receiverName}
        />
      ) : (
        <TransactionOverviewItem label={t('to')} value={receiver} />
      )}
      <TransactionOverviewItem
        label={t('network')}
        value={
          <HStack alignItems="center" gap={4}>
            <ChainEntityIcon
              value={getChainLogoSrc(chain)}
              style={{ fontSize: 16 }}
            />
            <Text size={14} weight={500}>
              {chain}
            </Text>
          </HStack>
        }
      />
      <TransactionOverviewItem
        label={t('est_network_fee')}
        value={
          <MatchQuery
            value={keysignPayloadQuery}
            pending={() => <Spinner />}
            success={keysignPayload => (
              <HStack alignItems="center" gap={8}>
                <KeysignFeeAmount keysignPayload={keysignPayload} />
                {renderFeeExtra?.(keysignPayload)}
              </HStack>
            )}
          />
        }
      />
      {children}
    </List>
  )
}
