import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { SendFiatFee } from '@core/ui/vault/send/fee/SendFiatFeeWrapper'
import { useSendCappedAmountQuery } from '@core/ui/vault/send/queries/useSendCappedAmountQuery'
import { useSender } from '@core/ui/vault/send/sender/hooks/useSender'
import { useSendMemo } from '@core/ui/vault/send/state/memo'
import { useSendReceiver } from '@core/ui/vault/send/state/receiver'
import { useCurrentSendCoin } from '@core/ui/vault/send/state/sendCoin'
import { SendConfirm } from '@core/ui/vault/send/verify/SendConfirm'
import { SendTerms } from '@core/ui/vault/send/verify/SendTerms'
import {
  sendTerms,
  SendTermsProvider,
} from '@core/ui/vault/send/verify/state/sendTerms'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { HStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { OnBackProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { MiddleTruncate } from '@lib/ui/truncate'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { formatWalletAddress } from '@lib/utils/formatWalletAddress'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

export const SendVerify: FC<OnBackProp> = ({ onBack }) => {
  const { t } = useTranslation()
  const [{ coin: coinKey }] = useCurrentSendCoin()
  const sender = useSender()
  const { name } = useCurrentVault()
  const coin = useCurrentVaultCoin(coinKey)
  const [receiver] = useSendReceiver()
  const [memo] = useSendMemo()
  const cappedAmountQuery = useSendCappedAmountQuery()
  const { chain, ticker } = coin

  return (
    <SendTermsProvider initialValue={sendTerms.map(() => false)}>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={t('send_overview')}
        hasBorder
      />
      <PageContent gap={12}>
        <List title={t('you_are_sending')}>
          <ListItem
            icon={<CoinIcon coin={coin} style={{ fontSize: 32 }} />}
            title={
              <MatchQuery
                value={cappedAmountQuery}
                error={() => t('failed_to_load')}
                pending={() => <Spinner />}
                success={({ amount, decimals }) =>
                  `${formatTokenAmount(fromChainAmount(amount, decimals))} ${ticker}`
                }
              />
            }
          />
          <ListItem
            description={`${name} (${formatWalletAddress(sender)})`}
            title={t('from')}
          />
          <ListItem
            description={<MiddleTruncate text={receiver} />}
            title={t('to')}
          />
          <ListItem
            description={
              <HStack gap={4} alignItems="center">
                <ChainEntityIcon
                  value={getChainLogoSrc(chain)}
                  style={{ fontSize: 16 }}
                />
                {chain}
              </HStack>
            }
            title={t('network')}
          />
          {memo && <TxOverviewMemo value={memo} />}
          <SendFiatFee />
        </List>
        <SendTerms />
      </PageContent>
      <PageFooter>
        <SendConfirm />
      </PageFooter>
    </SendTermsProvider>
  )
}
