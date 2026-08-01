import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { VerifyKeysignStart } from '@core/ui/mpc/keysign/start/VerifyKeysignStart'
import { VerifyTransactionOverview } from '@core/ui/mpc/keysign/verify/VerifyTransactionOverview'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCore } from '@core/ui/state/core'
import { StakingAmountInput } from '@core/ui/vault/deposit/DepositForm/ActionSpecific/CosmosStakingSpecific/StakingAmountInput'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Button } from '@lib/ui/buttons/Button'
import { PercentageSelector } from '@lib/ui/inputs/PercentageSelector'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import {
  AccountCoin,
  extractAccountCoinKey,
} from '@vultisig/core-chain/coin/AccountCoin'
import { attempt } from '@vultisig/lib-utils/attempt'
import { decimalStringToBigInt } from '@vultisig/lib-utils/bigint/decimalStringToBigInt'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import {
  tonstakersBurnMessageValue,
  tonstakersFeeReserve,
  tonstakersMinStake,
  tonstakersNativeTicker,
  tonstakersPoolBounceableAddress,
  tonstakersReceiptCoin,
} from './core'
import { TonstakersAction } from './keysignPayload/build'
import { useTonstakersKeysignPayloadQuery } from './keysignPayload/query'
import { useTonstakersPositionQuery } from './queries/useTonstakersPositionQuery'
import { useTonstakersProtocolInfoQuery } from './queries/useTonstakersProtocolInfoQuery'

const tonNetworkFee = 10_000_000n

export const TonstakersPage = () => {
  const { t } = useTranslation()
  const { goBack } = useCore()
  const vaultCoins = useCurrentVaultCoins()
  const [{ action }] = useCoreViewState<'tonstakers'>()
  const [reviewAmount, setReviewAmount] = useState<bigint | null>(null)
  const tonCoin = vaultCoins.find(coin => coin.chain === Chain.Ton && !coin.id)

  if (!tonCoin) {
    return (
      <VStack fullHeight>
        <PageHeader
          primaryControls={<PageHeaderBackButton onClick={goBack} />}
          title={t('tonstakers_liquid_staking')}
          hasBorder
        />
        <PageContent>
          <Text color="danger">{t('ton_stake_chain_not_enabled')}</Text>
        </PageContent>
      </VStack>
    )
  }

  return reviewAmount === null ? (
    <TonstakersAmountForm
      action={action}
      coin={tonCoin}
      onBack={goBack}
      onReview={setReviewAmount}
    />
  ) : (
    <TonstakersVerify
      action={action}
      amount={reviewAmount}
      coin={tonCoin}
      onBack={() => setReviewAmount(null)}
    />
  )
}

type TonstakersAmountFormProps = {
  action: TonstakersAction
  coin: AccountCoin
  onBack: () => void
  onReview: (amount: bigint) => void
}

const TonstakersAmountForm = ({
  action,
  coin,
  onBack,
  onReview,
}: TonstakersAmountFormProps) => {
  const { t } = useTranslation()
  const [amount, setAmount] = useState('')
  const isStake = action === 'stake'
  const nativeBalanceQuery = useBalanceQuery(extractAccountCoinKey(coin))
  const positionQuery = useTonstakersPositionQuery(
    isStake ? undefined : coin.address
  )
  const protocolQuery = useTonstakersProtocolInfoQuery(isStake)
  const decimals = isStake ? coin.decimals : tonstakersReceiptCoin.decimals
  const ticker = isStake ? tonstakersNativeTicker : tonstakersReceiptCoin.ticker
  const balanceUnits = isStake
    ? (nativeBalanceQuery.data ?? 0n)
    : (positionQuery.data?.jettonBalance ?? 0n)
  const maxAmount = isStake
    ? balanceUnits > tonstakersFeeReserve
      ? balanceUnits - tonstakersFeeReserve
      : 0n
    : balanceUnits

  const amountUnits = (() => {
    if (!amount) return null
    const result = attempt(() => decimalStringToBigInt(amount, decimals))
    if ('error' in result || result.data < 0n) return null
    return result.data
  })()

  const nativeBalance = nativeBalanceQuery.data ?? 0n
  const minimumStake = protocolQuery.data?.minStake
  const formattedMinimum = minimumStake
    ? formatAmount(Number(fromChainAmount(minimumStake, coin.decimals)))
    : undefined
  const amountError = (() => {
    if (amountUnits === null) return undefined
    if (amountUnits <= 0n) return t('amount_must_be_positive')
    if (isStake && minimumStake !== undefined && amountUnits < minimumStake) {
      return t('tonstakers_below_minimum', { minimum: formattedMinimum })
    }
    if (amountUnits > maxAmount) {
      return t('tonstakers_insufficient_balance')
    }
    if (
      !isStake &&
      nativeBalance < tonstakersBurnMessageValue + tonNetworkFee
    ) {
      return t('tonstakers_unstake_insufficient_ton')
    }
    return undefined
  })()

  const isLoading =
    nativeBalanceQuery.isPending ||
    (isStake ? protocolQuery.isPending : positionQuery.isPending)
  const sourceError =
    nativeBalanceQuery.error ??
    (isStake ? protocolQuery.error : positionQuery.error)
  const canSubmit =
    !isLoading &&
    !sourceError &&
    amountUnits !== null &&
    amountUnits > 0n &&
    !amountError

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={
          isStake ? t('tonstakers_stake_title') : t('tonstakers_unstake_title')
        }
        hasBorder
      />
      <PageContent gap={16} flexGrow scrollable>
        <Card>
          <Text size={14} color="regular">
            {isStake ? t('amount') : t('amount_to_unstake')}
          </Text>
          <CenteredAmount>
            <StakingAmountInput
              value={amount}
              onChange={setAmount}
              ticker={ticker}
            />
          </CenteredAmount>
          <PercentageSelector
            max={maxAmount}
            value={amountUnits}
            onChange={units =>
              setAmount(
                units === null ? '' : String(fromChainAmount(units, decimals))
              )
            }
          />
          <HStack justifyContent="space-between">
            <Text size={13} color="regular">
              {t('balance_available')}:
            </Text>
            <Text size={14} color="shy">
              {formatAmount(Number(fromChainAmount(balanceUnits, decimals)))}{' '}
              {ticker}
            </Text>
          </HStack>
        </Card>

        {sourceError ? (
          <Text size={12} color="danger">
            {t('failed_to_load')}
          </Text>
        ) : amountError ? (
          <Text size={12} color="danger">
            {amountError}
          </Text>
        ) : (
          <Text size={12} color="shy">
            {isStake
              ? t('tonstakers_stake_note', { minimum: formattedMinimum })
              : t('tonstakers_withdrawal_note')}
          </Text>
        )}
      </PageContent>
      <PageFooter>
        <Button
          type="button"
          onClick={() => amountUnits !== null && onReview(amountUnits)}
          disabled={!canSubmit}
        >
          {amount ? t('continue') : t('enter_amount')}
        </Button>
      </PageFooter>
    </VStack>
  )
}

type TonstakersVerifyProps = {
  action: TonstakersAction
  amount: bigint
  coin: AccountCoin
  onBack: () => void
}

const TonstakersVerify = ({
  action,
  amount,
  coin,
  onBack,
}: TonstakersVerifyProps) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const isStake = action === 'stake'
  const positionQuery = useTonstakersPositionQuery(
    isStake ? undefined : coin.address
  )
  const protocolQuery = useTonstakersProtocolInfoQuery(isStake)
  const baseKeysignPayloadQuery = useTonstakersKeysignPayloadQuery({
    action,
    amount,
    coin,
    jettonWalletAddress: positionQuery.data?.jettonWalletAddress,
    minimumStake: protocolQuery.data?.minStake,
  })
  const prerequisiteQuery = isStake ? protocolQuery : positionQuery
  const prerequisiteReady = isStake
    ? protocolQuery.data !== undefined
    : positionQuery.data !== undefined && positionQuery.data !== null
  const prerequisiteError =
    prerequisiteQuery.error ??
    (!prerequisiteQuery.isPending && !prerequisiteReady
      ? new Error(t('no_positions_found'))
      : null)
  const keysignPayloadQuery = {
    ...baseKeysignPayloadQuery,
    error: prerequisiteError ?? baseKeysignPayloadQuery.error,
    isPending:
      !prerequisiteError &&
      (prerequisiteQuery.isPending ||
        (prerequisiteReady && baseKeysignPayloadQuery.isPending)),
  }
  const displayCoin = isStake
    ? { ...coin, ticker: tonstakersNativeTicker }
    : tonstakersReceiptCoin
  const receiver = isStake
    ? tonstakersPoolBounceableAddress
    : (positionQuery.data?.jettonWalletAddress ?? '')

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={t('send_overview')}
      />
      <VerifyKeysignStart
        keysignPayloadQuery={keysignPayloadQuery}
        extraPendingMessage={
          prerequisiteQuery.isPending ? t('loading') : undefined
        }
      >
        <VerifyTransactionOverview
          coin={displayCoin}
          amount={amount}
          senderName={vault.name}
          senderAddress={coin.address}
          receiver={receiver}
          chain={Chain.Ton}
          keysignPayloadQuery={keysignPayloadQuery}
          getPayloadAmount={() => amount}
        >
          <ListItem
            title={t('provider')}
            description={t('tonstakers_liquid_staking')}
          />
          <ListItem
            title={t('details')}
            description={
              isStake
                ? t('tonstakers_stake_note', {
                    minimum: formatAmount(
                      Number(
                        fromChainAmount(
                          protocolQuery.data?.minStake ?? tonstakersMinStake,
                          coin.decimals
                        )
                      )
                    ),
                  })
                : t('tonstakers_withdrawal_note')
            }
          />
        </VerifyTransactionOverview>
      </VerifyKeysignStart>
    </>
  )
}

const Card = styled(VStack).attrs({ gap: 12, flexGrow: true })`
  padding: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
`

const CenteredAmount = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
`
