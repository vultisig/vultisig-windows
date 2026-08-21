import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { Button } from '@lib/ui/buttons/Button'
import { HStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { kaminoShareToTokenValue } from '@vultisig/core-chain/chains/solana/kamino/amount'
import { KaminoVaultInfo } from '@vultisig/core-chain/chains/solana/kamino/models'
import { KaminoSharePosition } from '@vultisig/core-chain/chains/solana/kamino/position'
import { KaminoWithdrawRequest } from '@vultisig/core-chain/chains/solana/kamino/tx/validate'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { KaminoAmountField } from '../KaminoAmountField'
import { resolveWithdrawShares } from './resolveWithdrawShares'

type KaminoWithdrawFormProps = OnFinishProp<KaminoWithdrawRequest> & {
  vault: KaminoVaultInfo
  coin: AccountCoin
  position: KaminoSharePosition
  priceUsd: number
}

/**
 * Amount entry for a Kamino withdrawal.
 *
 * Denominated in the underlying token, because that is what a holder thinks
 * in — the shares the chain actually burns are resolved by the chain package's
 * exact arithmetic, never here.
 */
export const KaminoWithdrawForm = ({
  vault,
  coin,
  position,
  priceUsd,
  onFinish,
}: KaminoWithdrawFormProps) => {
  const { t } = useTranslation()
  const formatFiatAmount = useFormatFiatAmount()
  const [value, setValue] = useState<number | null>(null)

  const spendableTokens = kaminoShareToTokenValue({
    shares: position.spendable,
    tokensPerShare: vault.tokensPerShare,
    tokenDecimals: coin.decimals,
  })
  const available = spendableTokens
    ? fromChainAmount(spendableTokens.baseUnits, coin.decimals)
    : 0

  // Derived, never tracked: a flag set by one control goes stale the moment
  // another moves the value, and the max path must engage whichever control
  // reached the balance — the slider at 100%, or the amount typed out in full.
  const isMax = value !== null && available > 0 && value >= available

  const shares =
    value === null || value <= 0
      ? undefined
      : resolveWithdrawShares({
          tokenAmount: value,
          tokenDecimals: coin.decimals,
          tokensPerShare: vault.tokensPerShare,
          position,
          isMax,
        })

  const minWithdrawTokens = kaminoShareToTokenValue({
    shares: vault.minWithdraw,
    tokensPerShare: vault.tokensPerShare,
    tokenDecimals: coin.decimals,
  })

  const error =
    value === null || value <= 0
      ? undefined
      : !shares
        ? t('kamino_earn_amount_unavailable')
        : value > available
          ? t('insufficient_balance')
          : shares.baseUnits < vault.minWithdraw.baseUnits
            ? t('kamino_earn_below_minimum', {
                amount: formatAmount(
                  minWithdrawTokens
                    ? fromChainAmount(
                        minWithdrawTokens.baseUnits,
                        coin.decimals
                      )
                    : 0,
                  { ticker: coin.ticker }
                ),
              })
            : undefined

  // Advisory, never blocking: a vault keeps only a small share of its assets
  // liquid, so a withdrawal above that buffer is the ordinary case rather than
  // an exception — it settles once the vault frees the funds.
  const exceedsLiquidBuffer =
    vault.tokensAvailable !== undefined &&
    value !== null &&
    spendableTokens !== undefined &&
    error === undefined &&
    value > fromChainAmount(vault.tokensAvailable.baseUnits, coin.decimals)

  const canContinue = shares !== undefined && error === undefined

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={vault.name}
        hasBorder
      />
      <PageContent gap={16} flexGrow scrollable>
        <KaminoAmountField
          value={value}
          onChange={setValue}
          ticker={coin.ticker}
          decimals={coin.decimals}
          balance={available}
          balanceUnits={spendableTokens?.baseUnits ?? 0n}
          balanceLabel={t('kamino_earn_available_to_withdraw')}
          error={error}
        />
        {priceUsd > 0 && value !== null && value > 0 ? (
          <HStack justifyContent="space-between">
            <Text size={13} color="shy">
              {t('value')}
            </Text>
            <Text size={13} color="supporting">
              {formatFiatAmount(value * priceUsd)}
            </Text>
          </HStack>
        ) : null}
        {exceedsLiquidBuffer ? (
          <WarningBlock>{t('kamino_earn_delayed_liquidity')}</WarningBlock>
        ) : null}
      </PageContent>
      <PageFooter>
        <Button
          disabled={!canContinue}
          onClick={() => {
            if (!shares) return
            onFinish({ shares, unstakedShares: position.unstaked })
          }}
        >
          {t('continue')}
        </Button>
      </PageFooter>
    </>
  )
}
