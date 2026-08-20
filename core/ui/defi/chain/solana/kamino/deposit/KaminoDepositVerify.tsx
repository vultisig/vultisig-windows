import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { StartKeysignPromptWithRefresh } from '@core/ui/mpc/keysign/start/StartKeysignPromptWithRefresh'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp } from '@lib/ui/props'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { KaminoTokenAmount } from '@vultisig/core-chain/chains/solana/kamino/amount'
import { KaminoVaultInfo } from '@vultisig/core-chain/chains/solana/kamino/models'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'

import { KaminoTransactionSummary } from '../verify/KaminoTransactionSummary'
import { KaminoUnreadableTransaction } from '../verify/KaminoUnreadableTransaction'
import { readKaminoKeysignTransaction } from '../verify/readKaminoKeysignTransaction'
import { useKaminoDepositKeysignPayloadQuery } from './queries/useKaminoDepositKeysignPayloadQuery'

type KaminoDepositVerifyProps = OnBackProp & {
  vault: KaminoVaultInfo
  coin: AccountCoin
  amount: KaminoTokenAmount
  priceUsd: number
}

/**
 * Review step for a Kamino deposit. The payload is built here and rebuilt the
 * moment signing starts, so the blockhash it embeds is young and the SDK's
 * gates run against the bytes actually being signed rather than against
 * whatever was fetched when this screen opened.
 */
export const KaminoDepositVerify = ({
  vault,
  coin,
  amount,
  priceUsd,
  onBack,
}: KaminoDepositVerifyProps) => {
  const { t } = useTranslation()
  const formatFiatAmount = useFormatFiatAmount()
  const keysignPayloadQuery = useKaminoDepositKeysignPayloadQuery({
    vault,
    coin,
    amount,
  })
  const { data, error, isPending } = keysignPayloadQuery

  const humanAmount = fromChainAmount(amount.baseUnits, amount.decimals)

  // An independent reading of the bytes the payload carries, so this screen
  // checks the transaction rather than echoing the form that built it — the
  // same reading a co-signing device performs.
  const reading = data ? readKaminoKeysignTransaction(data) : undefined
  const isUnreadable = reading !== undefined && 'unreadable' in reading

  const promptProps = isPending
    ? { disabledMessage: t('loading') }
    : error
      ? { disabledMessage: extractErrorMsg(error) }
      : isUnreadable
        ? { disabledMessage: t('kamino_earn_unreadable_title') }
        : { keysignPayload: { keysign: data } }

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={t('verify')}
        hasBorder
      />
      <PageContent gap={16} flexGrow scrollable>
        <List>
          <ListItem
            title={t('kamino_earn_deposit_to')}
            extra={vault.name}
            hoverable={false}
          />
          <ListItem
            title={t('amount')}
            extra={formatAmount(humanAmount, { ticker: coin.ticker })}
            hoverable={false}
          />
          {priceUsd > 0 ? (
            <ListItem
              title={t('value')}
              extra={formatFiatAmount(humanAmount * priceUsd)}
              hoverable={false}
            />
          ) : null}
          <ListItem
            title={t('kamino_earn_apy_30d')}
            extra={`${(vault.apy30d * 100).toFixed(2)}%`}
            hoverable={false}
          />
        </List>
        {reading && 'decoded' in reading ? (
          <KaminoTransactionSummary decoded={reading.decoded} />
        ) : null}
        {isUnreadable ? <KaminoUnreadableTransaction /> : null}
      </PageContent>
      <PageFooter>
        <StartKeysignPromptWithRefresh
          keysignPayloadQuery={keysignPayloadQuery}
          toKeysignPayload={keysign => ({ keysign })}
          promptProps={promptProps}
        />
      </PageFooter>
    </>
  )
}
