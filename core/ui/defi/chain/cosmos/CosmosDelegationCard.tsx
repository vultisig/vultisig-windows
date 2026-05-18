import { ValidatorAvatar } from '@core/ui/chain/cosmos/staking/components/ValidatorAvatar'
import { ChainAction } from '@core/ui/vault/deposit/ChainAction'
import { Button } from '@lib/ui/buttons/Button'
import { CalendarDaysIcon } from '@lib/ui/icons/CalendarDaysIcon'
import { PercentIcon } from '@lib/ui/icons/PercentIcon'
import { TrophyIcon } from '@lib/ui/icons/TrophyIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { type Validator } from '@vultisig/core-chain/chains/cosmos/staking/lcdQueries'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type CosmosDelegationCardProps = {
  validator: Validator
  /** Staked amount in base units (e.g. uluna). */
  amount: bigint
  fiat: number
  ticker: string
  decimals: number
  /** Validator-level pending rewards in the staking denom, base units. */
  pendingRewardsUnits: bigint
  /** Estimated APY as a Number in [0, 1]; rendered as percent. */
  apy?: number
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
  onAction,
}: CosmosDelegationCardProps) => {
  const { t } = useTranslation()
  const stakedUi = fromChainAmount(amount, decimals)
  const rewardsUi = fromChainAmount(pendingRewardsUnits, decimals)
  // Mirror Figma: "Active" for bonded non-jailed, "Churned Out" otherwise.
  // The Cosmos analog of THORChain "churn" is bond status / jailing.
  const isActive =
    validator.status === 'BOND_STATUS_BONDED' && !validator.jailed
  const canUnstake = isActive && amount > 0n

  return (
    <Card>
      <Header>
        <ValidatorAvatar moniker={validator.description.moniker} />
        <VStack gap={2} flexGrow>
          <Text size={15} weight="500">
            {validator.description.moniker || 'Unnamed'}
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
          ${fiat.toFixed(2)}
        </Text>
      </Row>
      {apy !== undefined && (
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
      )}
      <Divider />
      <Row>
        <VStack gap={4}>
          <LabelWithIcon>
            <IconBox>
              <CalendarDaysIcon style={{ fontSize: 16 }} />
            </IconBox>
            <Text size={12} color="shy">
              {t('next_churn')}
            </Text>
          </LabelWithIcon>
          <Text size={14}>—</Text>
        </VStack>
        <VStack gap={4}>
          <LabelWithIcon>
            <IconBox>
              <TrophyIcon style={{ fontSize: 16 }} />
            </IconBox>
            <Text size={12} color="shy">
              {t('next_award')}
            </Text>
          </LabelWithIcon>
          <Text size={14}>
            {rewardsUi} {ticker}
          </Text>
        </VStack>
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

const LabelWithIcon = styled(HStack).attrs({ gap: 6, alignItems: 'center' })``

const IconBox = styled.span`
  display: inline-flex;
  align-items: center;
  color: ${getColor('textShy')};
`
