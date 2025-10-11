import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { VerifyKeysignStart } from '@core/ui/mpc/keysign/start/VerifyKeysignStart'
import { useSendCappedAmountQuery } from '@core/ui/vault/send/queries/useSendCappedAmountQuery'
import { useSender } from '@core/ui/vault/send/sender/hooks/useSender'
import { useSendMemo } from '@core/ui/vault/send/state/memo'
import { useSendReceiver } from '@core/ui/vault/send/state/receiver'
import { useCurrentSendCoin } from '@core/ui/vault/send/state/sendCoin'
import { useSendTxKeysignPayloadQuery } from '@core/ui/vault/send/state/useSendTxKeysignPayloadQuery'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { formatAmount } from '@lib/utils/formatAmount'
import { formatWalletAddress } from '@lib/utils/formatWalletAddress'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { SendFeeValue } from '../fee/SendFeeValue'

const sendTerms = ['send_terms_1', 'send_terms_0'] as const

export const SendVerify: FC<OnBackProp> = ({ onBack }) => {
  const { t } = useTranslation()
  const { name } = useCurrentVault()
  const [receiver] = useSendReceiver()
  const [memo] = useSendMemo()
  const coin = useCurrentSendCoin()
  const sender = useSender()
  const cappedAmountQuery = useSendCappedAmountQuery()
  const keysignPayloadQuery = useSendTxKeysignPayloadQuery()
  const translatedTerms = sendTerms.map(term => t(term))

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={t('send_overview')}
      />
      <VerifyKeysignStart
        keysignPayloadQuery={keysignPayloadQuery}
        terms={translatedTerms}
      >
        <List border="gradient">
          <ListItem
            title={
              <VStack gap={24}>
                <Text as="span" color="shyExtra" size={15} weight={500}>
                  {t('you_are_sending')}
                </Text>
                <HStack alignItems="center" gap={8}>
                  <CoinIcon coin={coin} style={{ fontSize: 24 }} />
                  <MatchQuery
                    value={cappedAmountQuery}
                    error={() => (
                      <Text color="danger">{t('failed_to_load')}</Text>
                    )}
                    pending={() => <Spinner />}
                    success={({ amount, decimals }) => (
                      <HStack alignItems="center" gap={4}>
                        <Text as="span" size={17}>
                          {formatAmount(fromChainAmount(amount, decimals))}
                        </Text>
                        <Text as="span" color="shy" size={17}>
                          {coin.ticker}
                        </Text>
                      </HStack>
                    )}
                  />
                </HStack>
              </VStack>
            }
          />
          <ListItem
            extra={
              <HStack alignItems="center" gap={8}>
                <Text as="span" size={14} weight={500}>
                  {name}
                </Text>
                <Text as="span" color="shy" size={14} weight={500}>
                  ({formatWalletAddress(sender)})
                </Text>
              </HStack>
            }
            title={t('from')}
            styles={{ title: { color: 'textShy' } }}
          />
          <ListItem
            extra={
              <MiddleTruncate
                size={14}
                text={receiver}
                weight={500}
                width={200}
              />
            }
            title={t('to')}
            styles={{ title: { color: 'textShy' } }}
          />
          <ListItem
            extra={
              <HStack alignItems="center" gap={4}>
                <ChainEntityIcon
                  value={getChainLogoSrc(coin.chain)}
                  style={{ fontSize: 16 }}
                />
                <Text size={14} weight={500}>
                  {coin.chain}
                </Text>
              </HStack>
            }
            title={t('network')}
            styles={{ title: { color: 'textShy' } }}
          />
          <ListItem
            extra={<SendFeeValue />}
            title={t('est_network_fee')}
            styles={{ title: { color: 'textShy' } }}
          />
          {memo && (
            <ListItem
              title={<TxOverviewMemo value={memo} chain={coin.chain} />}
            />
          )}
        </List>
      </VerifyKeysignStart>
    </>
  )
}
