import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { ValidatorAvatar } from '@core/ui/chain/cosmos/staking/components/ValidatorAvatar'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCore } from '@core/ui/state/core'
import { StakingAmountInput } from '@core/ui/vault/deposit/DepositForm/ActionSpecific/CosmosStakingSpecific/StakingAmountInput'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Button } from '@lib/ui/buttons/Button'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { CircleCheckIcon } from '@lib/ui/icons/CircleCheckIcon'
import { PercentageSelector } from '@lib/ui/inputs/PercentageSelector'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { tonAddressToBounceable } from '@vultisig/core-chain/chains/ton/address'
import {
  tonStakingDepositBuffer,
  tonStakingDepositComment,
  tonStakingFeeReserve,
  TonStakingPool,
} from '@vultisig/core-chain/chains/ton/staking'
import {
  AccountCoin,
  extractAccountCoinKey,
} from '@vultisig/core-chain/coin/AccountCoin'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { attempt } from '@vultisig/lib-utils/attempt'
import { decimalStringToBigInt } from '@vultisig/lib-utils/bigint/decimalStringToBigInt'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { TonPoolPicker } from './components/TonPoolPicker'
import { useStakeTonAsSend } from './hooks/useStakeTonAsSend'

/**
 * Deposit flow for TON nominator-pool staking. First-time stakes enter an
 * amount and pick a pool (via a modal picker); "add more" reuses the existing
 * pool (amount only). Reuses the Cosmos staking form layout (centered amount,
 * percentage selector, balance line, picker field) so it matches the LUNA/QBTC
 * deposit screens. On submit it hands off to the send flow's verify step.
 */
export const TonStakePage = () => {
  const { t } = useTranslation()
  const { goBack } = useCore()
  const vaultCoins = useCurrentVaultCoins()

  const tonCoin = vaultCoins.find(coin => coin.chain === Chain.Ton && !coin.id)

  if (!tonCoin) {
    return (
      <VStack fullHeight>
        <PageHeader
          primaryControls={<PageHeaderBackButton onClick={goBack} />}
          title={t('ton_stake_title', {
            ticker: chainFeeCoin[Chain.Ton].ticker,
          })}
          hasBorder
        />
        <PageContent>
          <Text color="danger">{t('ton_stake_chain_not_enabled')}</Text>
        </PageContent>
      </VStack>
    )
  }

  return <TonStakePageContent coin={tonCoin} />
}

const TonStakePageContent = ({ coin }: { coin: AccountCoin }) => {
  const { t } = useTranslation()
  const { goBack } = useCore()
  const [{ existingPoolAddress, existingPoolImplementation }] =
    useCoreViewState<'tonStake'>()
  const stakeAsSend = useStakeTonAsSend()

  const [selectedPool, setSelectedPool] = useState<TonStakingPool | null>(null)
  const [amount, setAmount] = useState('')
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))

  const isAddMore = !!existingPoolAddress
  const { decimals, ticker } = coin

  const balanceUnits = balanceQuery.data ?? 0n
  const balanceUi = fromChainAmount(balanceUnits, decimals)

  const amountUnits = (() => {
    if (!amount) return null
    const result = attempt(() => decimalStringToBigInt(amount, decimals))
    if ('error' in result) return null
    return result.data < 0n ? null : result.data
  })()

  // Add-more reuses the existing pool (its `min_stake` isn't re-fetched), so
  // fall back to a conservative 1-TON floor — real pools require far more, this
  // only guards dust. First-time stakes use the picked pool's minimum.
  const poolMinUnits = selectedPool
    ? selectedPool.minStake
    : tonStakingDepositBuffer
  const requiredMinUnits = poolMinUnits + tonStakingDepositBuffer

  // Reserve the network fee so "Max" / a full-balance stake still leaves enough
  // to broadcast.
  const maxStakeableUnits =
    balanceUnits > tonStakingFeeReserve
      ? balanceUnits - tonStakingFeeReserve
      : 0n

  const implementation = isAddMore
    ? existingPoolImplementation
    : selectedPool?.implementation
  const depositComment = tonStakingDepositComment(implementation)

  const amountSet = amountUnits !== null && amountUnits > 0n
  const amountError =
    amountUnits === null
      ? undefined
      : amountUnits < requiredMinUnits
        ? t('ton_stake_below_minimum', {
            amount: formatAmount(
              Number(fromChainAmount(requiredMinUnits, decimals))
            ),
            ticker,
          })
        : amountUnits > maxStakeableUnits
          ? t('ton_stake_insufficient_balance')
          : undefined

  const hasPool = isAddMore || !!selectedPool
  const canSubmit =
    amountSet && !amountError && hasPool && !!depositComment && amountUnits

  const handleSubmit = () => {
    if (!canSubmit || amountUnits === null || !depositComment) return

    const poolAddress = isAddMore
      ? existingPoolAddress
      : selectedPool
        ? tonAddressToBounceable(selectedPool.address)
        : undefined
    if (!poolAddress) return

    stakeAsSend({
      coin,
      poolAddress,
      memo: depositComment,
      kind: 'stake',
      amount: amountUnits,
    })
  }

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={goBack} />}
        title={t('ton_stake_title', { ticker })}
        hasBorder
      />
      <PageContent gap={16} flexGrow scrollable>
        <Card>
          <Text size={14} color="regular">
            {t('amount')}
          </Text>
          <CenteredAmount>
            <StakingAmountInput
              value={amount}
              onChange={setAmount}
              ticker={ticker}
            />
          </CenteredAmount>
          <PercentageSelector
            max={maxStakeableUnits}
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
              {balanceUi} {ticker}
            </Text>
          </HStack>
        </Card>

        {amountError ? (
          <Text size={12} color="danger">
            {amountError}
          </Text>
        ) : (
          <Text size={12} color="shy">
            {t('ton_stake_min', {
              amount: formatAmount(
                Number(fromChainAmount(requiredMinUnits, decimals))
              ),
            })}{' '}
            {ticker}
          </Text>
        )}

        {!isAddMore ? (
          <PoolField onClick={() => setIsPickerOpen(true)}>
            <Text size={14} color="regular">
              {t('ton_stake_pool_picker_header')}
            </Text>
            {selectedPool ? (
              <HStack alignItems="center" gap={8}>
                <ValidatorAvatar moniker={selectedPool.name} size={24} />
                <Text size={14} color="contrast">
                  {selectedPool.name}
                </Text>
                <SelectedIcon />
              </HStack>
            ) : (
              <HStack alignItems="center" gap={4}>
                <Text size={14} color="shy">
                  {t('ton_stake_select_pool')}
                </Text>
                <ChevronRightIcon style={{ fontSize: 18 }} />
              </HStack>
            )}
          </PoolField>
        ) : null}

        {hasPool && !depositComment ? (
          <Text size={12} color="warning">
            {t('ton_stake_unsupported_pool')}
          </Text>
        ) : null}
      </PageContent>

      <PageFooter>
        {!amountSet ? (
          <Button disabled type="button">
            {t('enter_amount')}
          </Button>
        ) : !isAddMore && !selectedPool ? (
          <Button type="button" onClick={() => setIsPickerOpen(true)}>
            {t('ton_stake_select_pool')}
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
            {t('continue')}
          </Button>
        )}
      </PageFooter>

      {isPickerOpen ? (
        <TonPoolPicker
          ticker={ticker}
          decimals={decimals}
          selectedAddress={selectedPool?.address}
          onSelect={pool => {
            setSelectedPool(pool)
            setIsPickerOpen(false)
          }}
          onClose={() => setIsPickerOpen(false)}
        />
      ) : null}
    </VStack>
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

const PoolField = styled.button.attrs({ type: 'button' })`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  background: transparent;
  border: 1px solid ${getColor('foregroundExtra')};

  &:hover {
    border-color: ${getColor('primary')};
  }
`

const SelectedIcon = styled(CircleCheckIcon)`
  color: ${getColor('success')};
  font-size: 18px;
`
