import { ValidatorAvatar } from '@core/ui/chain/cosmos/staking/components/ValidatorAvatar'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { ChainAction } from '@core/ui/vault/deposit/ChainAction'
import { Button } from '@lib/ui/buttons/Button'
import { PercentIcon } from '@lib/ui/icons/PercentIcon'
import { TrophyIcon } from '@lib/ui/icons/TrophyIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import {
  type UnbondingEntry,
  type Validator,
} from '@vultisig/core-chain/chains/cosmos/staking/lcdQueries'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type CosmosDelegationCardProps = {
  validator: Validator
  /** Staked amount in base units (e.g. uluna). */
  amount: bigint
  fiat: number
  ticker: string
  decimals: number
  /**
   * Validator-level pending rewards in the staking denom, in base units
   * (e.g. uluna). Fractional — Cosmos's distribution module accrues
   * sub-base-unit rewards per block and only rounds down at withdraw time,
   * so a fresh small stake can legitimately have e.g. 0.25 uluna pending.
   */
  pendingRewardsUnits: number
  /** Per-validator APY in [0, 1] (e.g. 0.0785 for 7.85%). Hidden when 0 or undefined. */
  apy?: number
  /**
   * Pending unbonding entries for this specific validator. When non-empty the
   * card shows the unlock date and disables the Unstake button — the user
   * has already started an unbond, so initiating another would race.
   */
  unbondingEntries?: UnbondingEntry[]
  /**
   * Chain-config unbonding period in days. Terra family is 21d; the param
   * is `staking.unbonding_time` and varies per chain so the value flows in
   * from the parent rather than being hard-coded here.
   */
  unbondingDays: number
  onAction: (
    action: Extract<ChainAction, 'undelegate' | 'redelegate' | 'delegate'>
  ) => void
}

const truncateValoper = (addr: string): string => {
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 12)}...${addr.slice(-4)}`
}

export const CosmosDelegationCard = ({
  validator,
  amount,
  fiat,
  ticker,
  decimals,
  pendingRewardsUnits,
  apy,
  unbondingEntries,
  unbondingDays,
  onAction,
}: CosmosDelegationCardProps) => {
  const { t } = useTranslation()
  const formatFiatAmount = useFormatFiatAmount()
  const stakedUi = fromChainAmount(amount, decimals)
  // Format pending rewards: small fractional amounts get up to 6 decimals
  // so users see "0.000001 LUNC" instead of a misleading "0 LUNC". Trim
  // trailing zeroes for readability.
  const rewardsUi = (() => {
    const ui = pendingRewardsUnits / 10 ** decimals
    if (ui === 0) return '0'
    return ui.toFixed(decimals).replace(/\.?0+$/, '')
  })()
  // Mirror Figma: "Active" for bonded non-jailed, "Churned Out" otherwise.
  // The Cosmos analog of THORChain "churn" is bond status / jailing.
  const isActive =
    validator.status === 'BOND_STATUS_BONDED' && !validator.jailed
  // Earliest pending unbonding for this validator (ISO completion time).
  // The lock disables Unstake until the unbonding completes — initiating
  // a second one before the first lands is allowed by the chain but
  // confuses the UX, so we surface the in-flight unbond instead.
  const nextUnlock = (unbondingEntries ?? [])
    .map(e => e.completionTime)
    .sort()[0]
  const isLocked = Boolean(nextUnlock)
  const canUnstake = isActive && amount > 0n && !isLocked

  return (
    <Card>
      <Header>
        <ValidatorAvatar
          moniker={validator.description.moniker}
          identity={validator.description.identity}
        />
        <VStack gap={2} flexGrow>
          <Text size={15} weight="500">
            {validator.description.moniker || t('unnamed_validator')}
          </Text>
          <Text size={12} color="shy">
            {truncateValoper(validator.operatorAddress)}
          </Text>
        </VStack>
        <Text size={13} weight="500" color={isActive ? 'success' : 'warning'}>
          {isActive
            ? t('validator_status_active')
            : t('validator_status_churned_out')}
        </Text>
      </Header>
      <Row>
        <Text size={14}>{t('staked_label', { amount: stakedUi, ticker })}</Text>
        <Text size={14} color="shy">
          {formatFiatAmount(fiat)}
        </Text>
      </Row>
      {apy !== undefined && apy > 0 ? (
        <Row>
          <LabelWithIcon>
            <IconBox>
              <PercentIcon />
            </IconBox>
            <Text size={14} color="shy">
              {t('apy')}
            </Text>
          </LabelWithIcon>
          <Text size={14} color="success">
            {(apy * 100).toFixed(2)}%
          </Text>
        </Row>
      ) : null}
      <Divider />
      <Row>
        <LabelWithIcon>
          <IconBox>
            <TrophyIcon style={{ fontSize: 16 }} />
          </IconBox>
          <Text size={12} color="shy">
            {t('pending_rewards')}
          </Text>
        </LabelWithIcon>
        <Text size={14}>
          {rewardsUi} {ticker}
        </Text>
      </Row>
      <ButtonRow>
        <Button
          kind="secondary"
          size="sm"
          disabled={!canUnstake}
          onClick={() => onAction('undelegate')}
        >
          {t('unstake')}
        </Button>
        <Button
          kind="secondary"
          size="sm"
          disabled={!canUnstake}
          onClick={() => onAction('redelegate')}
        >
          {t('move')}
        </Button>
        <Button kind="primary" size="sm" onClick={() => onAction('delegate')}>
          {t('stake')}
        </Button>
      </ButtonRow>
      {isLocked && nextUnlock ? (
        <UnbondingFooter>
          <Text size={12} color="shy">
            {t('unbonding_lock_label', { days: unbondingDays })}
          </Text>
          <Text size={12} color="shy">
            {t('unbonding_unlocks_at', {
              date: new Date(nextUnlock).toLocaleDateString(),
            })}
          </Text>
        </UnbondingFooter>
      ) : null}
    </Card>
  )
}

const Card = styled(VStack).attrs({ gap: 12 })`
  padding: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
  background: ${getColor('foreground')};
`

const Header = styled(HStack).attrs({ gap: 12, alignItems: 'center' })``

const Row = styled(HStack).attrs({ justifyContent: 'space-between' })``

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${getColor('foregroundExtra')};
  margin: 0;
`

const ButtonRow = styled(HStack).attrs({ gap: 8 })`
  > * {
    flex: 1;
  }
`

const UnbondingFooter = styled(HStack).attrs({
  justifyContent: 'space-between',
})`
  padding-top: 4px;
`

const LabelWithIcon = styled(HStack).attrs({ gap: 6, alignItems: 'center' })``

const IconBox = styled.span`
  display: inline-flex;
  align-items: center;
  color: ${getColor('textShy')};
`
