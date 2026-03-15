import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { CoinKey, CoinMetadata } from '@core/chain/coin/Coin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { KeysignFeeAmount } from '@core/ui/mpc/keysign/tx/FeeAmount'
import {
  TransactionOverviewAmount,
  TransactionOverviewItem,
} from '@core/ui/mpc/keysign/verify/components'
import { HStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Query } from '@lib/ui/query/Query'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { formatWalletAddress } from '@lib/utils/formatWalletAddress'
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
   * vault but is saved in the address book. Priority: vault name > address book name > raw address.
   */
  receiverAddressBookName?: string
  chain: Chain
  keysignPayloadQuery: Query<KeysignPayload>
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
  chain,
  keysignPayloadQuery,
  renderFeeExtra,
  children,
}: VerifyTransactionOverviewProps) => {
  const { t } = useTranslation()
  const formattedAmount = fromChainAmount(amount, coin.decimals)

  const receiverDisplay: ReactNode = (() => {
    if (receiverVaultName !== undefined && typeof receiver === 'string') {
      return (
        <HStack alignItems="center" gap={8}>
          <Text as="span" size={14} weight={500}>
            {receiverVaultName}
          </Text>
          <Text as="span" color="shy" size={14} weight={500}>
            ({formatWalletAddress(receiver)})
          </Text>
        </HStack>
      )
    }

    if (receiverAddressBookName !== undefined && typeof receiver === 'string') {
      return (
        <HStack alignItems="center" gap={8}>
          <Text as="span" size={14} weight={500}>
            {receiverAddressBookName}
          </Text>
          <Text as="span" color="shy" size={14} weight={500}>
            ({formatWalletAddress(receiver)})
          </Text>
        </HStack>
      )
    }

    if (typeof receiver === 'string') {
      return (
        <MiddleTruncate size={14} text={receiver} weight={500} width={200} />
      )
    }

    return receiver
  })()

  return (
    <List border="gradient" radius={16}>
      <TransactionOverviewAmount
        label={t('you_are_sending')}
        coin={coin}
        fallbackAmount={formattedAmount}
        keysignPayloadQuery={keysignPayloadQuery}
      />
      <TransactionOverviewItem
        label={t('from')}
        value={
          <HStack alignItems="center" gap={8}>
            <Text as="span" size={14} weight={500}>
              {senderName}
            </Text>
            <Text as="span" color="shy" size={14} weight={500}>
              ({formatWalletAddress(senderAddress)})
            </Text>
          </HStack>
        }
      />
      <TransactionOverviewItem label={t('to')} value={receiverDisplay} />
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
