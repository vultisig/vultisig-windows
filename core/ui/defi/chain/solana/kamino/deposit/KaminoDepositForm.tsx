import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { Button } from '@lib/ui/buttons/Button'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { toChainAmount } from '@vultisig/core-chain/amount/toChainAmount'
import {
  KaminoTokenAmount,
  kaminoTokenAmount,
} from '@vultisig/core-chain/chains/solana/kamino/amount'
import { KaminoVaultInfo } from '@vultisig/core-chain/chains/solana/kamino/models'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { KaminoAmountField } from '../KaminoAmountField'

type KaminoDepositFormProps = OnFinishProp<KaminoTokenAmount> & {
  vault: KaminoVaultInfo
  coin: AccountCoin
  priceUsd: number
}

/**
 * Amount entry for a Kamino deposit, bounded by what the wallet holds and by
 * the vault's own minimum.
 *
 * The minimum is the vault's EFFECTIVE one, which sits above the figure the
 * API publishes — the program refuses a deposit at exactly the published
 * amount, so offering it would let the user through to a transaction that
 * fails on chain.
 */
export const KaminoDepositForm = ({
  vault,
  coin,
  priceUsd,
  onFinish,
}: KaminoDepositFormProps) => {
  const { t } = useTranslation()
  const formatFiatAmount = useFormatFiatAmount()
  const [value, setValue] = useState<number | null>(null)

  const { data: balanceUnits = 0n } = useBalanceQuery(
    extractAccountCoinKey(coin)
  )
  const balance = fromChainAmount(balanceUnits, coin.decimals)
  const minDeposit = fromChainAmount(
    vault.minDeposit.baseUnits,
    vault.minDeposit.decimals
  )

  const amountUnits = value === null ? 0n : toChainAmount(value, coin.decimals)

  const error =
    value === null || value <= 0
      ? undefined
      : amountUnits > balanceUnits
        ? t('insufficient_balance')
        : amountUnits < vault.minDeposit.baseUnits
          ? t('kamino_earn_below_minimum', {
              amount: formatAmount(minDeposit, { ticker: coin.ticker }),
            })
          : undefined

  const canContinue = value !== null && value > 0 && error === undefined

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
          balance={balance}
          balanceUnits={balanceUnits}
          balanceLabel={t('balance_available')}
          error={error}
        />
        <VStack gap={8}>
          <HStack justifyContent="space-between">
            <Text size={13} color="shy">
              {t('kamino_earn_minimum_deposit')}
            </Text>
            <Text size={13} color="supporting">
              {formatAmount(minDeposit, { ticker: coin.ticker })}
            </Text>
          </HStack>
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
        </VStack>
      </PageContent>
      <PageFooter>
        <Button
          disabled={!canContinue}
          onClick={() =>
            onFinish(kaminoTokenAmount(amountUnits, coin.decimals))
          }
        >
          {t('continue')}
        </Button>
      </PageFooter>
    </>
  )
}
