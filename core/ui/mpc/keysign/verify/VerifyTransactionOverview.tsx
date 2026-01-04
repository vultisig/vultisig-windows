import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { CoinKey, CoinMetadata } from '@core/chain/coin/Coin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { KeysignFeeAmount } from '@core/ui/mpc/keysign/tx/FeeAmount'
import {
  TransactionOverviewAmount,
  TransactionOverviewCard,
  TransactionOverviewItem,
} from '@core/ui/mpc/keysign/verify/components'
import { HStack } from '@lib/ui/layout/Stack'
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
  chain,
  keysignPayloadQuery,
  renderFeeExtra,
  children,
}: VerifyTransactionOverviewProps) => {
  const { t } = useTranslation()
  const formattedAmount = fromChainAmount(amount, coin.decimals)

  return (
    <TransactionOverviewCard>
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
      <TransactionOverviewItem
        label={t('to')}
        value={
          typeof receiver === 'string' ? (
            <MiddleTruncate
              size={14}
              text={receiver}
              weight={500}
              width={200}
            />
          ) : (
            receiver
          )
        }
      />
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
    </TransactionOverviewCard>
  )
}
