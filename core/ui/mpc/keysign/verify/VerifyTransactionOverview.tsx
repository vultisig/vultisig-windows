import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { CoinKey, CoinMetadata } from '@core/chain/coin/Coin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { KeysignFeeAmount } from '@core/ui/mpc/keysign/tx/FeeAmount'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Query } from '@lib/ui/query/Query'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { formatAmount } from '@lib/utils/formatAmount'
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
    <List border="gradient">
      <ListItem
        title={
          <VStack gap={24}>
            <Text as="span" color="shyExtra" size={15} weight={500}>
              {t('you_are_sending')}
            </Text>
            <HStack alignItems="center" gap={8}>
              <CoinIcon coin={coin} style={{ fontSize: 24 }} />
              <HStack alignItems="center" gap={4}>
                <Text as="span" size={17}>
                  <MatchQuery
                    value={keysignPayloadQuery}
                    error={() => formatAmount(formattedAmount)}
                    pending={() => <Spinner />}
                    success={({ toAmount }) =>
                      formatAmount(fromChainAmount(toAmount, coin.decimals))
                    }
                  />
                </Text>
                <Text as="span" color="shy" size={17}>
                  {coin.ticker}
                </Text>
              </HStack>
            </HStack>
          </VStack>
        }
      />
      <ListItem
        extra={
          <HStack alignItems="center" gap={8}>
            <Text as="span" size={14} weight={500}>
              {senderName}
            </Text>
            <Text as="span" color="shy" size={14} weight={500}>
              ({formatWalletAddress(senderAddress)})
            </Text>
          </HStack>
        }
        title={t('from')}
        styles={{ title: { color: 'textShy' } }}
      />
      <ListItem
        extra={
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
        title={t('to')}
        styles={{ title: { color: 'textShy' } }}
      />
      <ListItem
        extra={
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
        title={t('network')}
        styles={{ title: { color: 'textShy' } }}
      />
      <ListItem
        extra={
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
        title={t('est_network_fee')}
        styles={{ title: { color: 'textShy' } }}
      />
      {children}
    </List>
  )
}
