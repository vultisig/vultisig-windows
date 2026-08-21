import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { StartKeysignPromptWithRefresh } from '@core/ui/mpc/keysign/start/StartKeysignPromptWithRefresh'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { kaminoShareToTokenValue } from '@vultisig/core-chain/chains/solana/kamino/amount'
import { KaminoVaultInfo } from '@vultisig/core-chain/chains/solana/kamino/models'
import { KaminoWithdrawRequest } from '@vultisig/core-chain/chains/solana/kamino/tx/validate'
import { kaminoUnstakeShares } from '@vultisig/core-chain/chains/solana/kamino/tx/validate'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'

import { KaminoTransactionSummary } from '../verify/KaminoTransactionSummary'
import { KaminoUnreadableTransaction } from '../verify/KaminoUnreadableTransaction'
import { readKaminoKeysignTransaction } from '../verify/readKaminoKeysignTransaction'
import { useKaminoWithdrawKeysignPayloadQuery } from './queries/useKaminoWithdrawKeysignPayloadQuery'

type KaminoWithdrawVerifyProps = OnBackProp & {
  vault: KaminoVaultInfo
  coin: AccountCoin
  request: KaminoWithdrawRequest
  priceUsd: number
}

/**
 * Review step for a Kamino withdrawal. Names the share count being burned as
 * well as what it is worth, because shares are what the instruction carries
 * and the token figure moves with the vault's rate.
 */
export const KaminoWithdrawVerify = ({
  vault,
  coin,
  request,
  priceUsd,
  onBack,
}: KaminoWithdrawVerifyProps) => {
  const { t } = useTranslation()
  const formatFiatAmount = useFormatFiatAmount()
  const keysignPayloadQuery = useKaminoWithdrawKeysignPayloadQuery({
    vault,
    coin,
    request,
  })
  const { data, error, isPending } = keysignPayloadQuery

  const tokenValue = kaminoShareToTokenValue({
    shares: request.shares,
    tokensPerShare: vault.tokensPerShare,
    tokenDecimals: coin.decimals,
  })
  // A conversion that failed is not a zero payout: reporting one would tell
  // the holder they receive nothing for shares the chain is about to burn.
  const humanAmount = tokenValue
    ? fromChainAmount(tokenValue.baseUnits, coin.decimals)
    : undefined

  // A withdrawal that has to release shares from the farm first runs two extra
  // instructions; saying so explains why this one differs from the last.
  const releasesFromFarm = kaminoUnstakeShares(request).baseUnits > 0n

  // An independent reading of the bytes the payload carries, so this screen
  // checks the transaction rather than echoing the form that built it — the
  // same reading a co-signing device performs.
  const reading = data ? readKaminoKeysignTransaction(data) : undefined
  const isUnreadable = reading !== undefined && 'unreadable' in reading

  // Both refusals block signing: an amount that could not be computed, and
  // bytes that could not be read.
  const promptProps =
    humanAmount === undefined
      ? { disabledMessage: t('kamino_earn_amount_unavailable') }
      : isPending
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
            title={t('kamino_earn_withdraw_from')}
            extra={vault.name}
            hoverable={false}
          />
          <ListItem
            title={t('kamino_earn_you_receive')}
            extra={
              humanAmount === undefined
                ? t('kamino_earn_amount_unavailable')
                : formatAmount(humanAmount, { ticker: coin.ticker })
            }
            hoverable={false}
          />
          {priceUsd > 0 && humanAmount !== undefined ? (
            <ListItem
              title={t('value')}
              extra={formatFiatAmount(humanAmount * priceUsd)}
              hoverable={false}
            />
          ) : null}
          <ListItem
            title={t('kamino_earn_shares_burned')}
            extra={formatAmount(
              fromChainAmount(request.shares.baseUnits, request.shares.decimals)
            )}
            hoverable={false}
          />
        </List>
        {reading && 'decoded' in reading ? (
          <KaminoTransactionSummary decoded={reading.decoded} />
        ) : null}
        {isUnreadable ? <KaminoUnreadableTransaction /> : null}
        <Text size={12} color="shy">
          {t('kamino_earn_receive_estimate')}
        </Text>
        {releasesFromFarm ? (
          <Text size={12} color="shy">
            {t('kamino_earn_releases_from_farm')}
          </Text>
        ) : null}
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
