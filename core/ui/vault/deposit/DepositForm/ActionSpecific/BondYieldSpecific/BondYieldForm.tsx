import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useDepositCoin } from '@core/ui/vault/deposit/providers/DepositCoinProvider'
import { useDepositFormHandlers } from '@core/ui/vault/deposit/providers/DepositFormHandlersProvider'
import { AmountSuggestion } from '@core/ui/vault/send/amount/AmountSuggestion'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { Slider } from '@lib/ui/inputs/Slider'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { formatWalletAddress } from '@vultisig/lib-utils/formatWalletAddress'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { FormData } from '../../types'
import { BondYieldInfoRow } from './BondYieldInfoRow'

const payoutShortcuts = [0.25, 0.5, 0.75, 1]

type BondYieldFormProps = {
  formValues: FormData
}

/** The Rewards Payout form: the share of a node's future bond rewards paid out to the vault, in RUNE. */
export const BondYieldForm = ({ formValues }: BondYieldFormProps) => {
  const { t } = useTranslation()
  const [{ setValue }] = useDepositFormHandlers()
  const [coin] = useDepositCoin()

  const percentage = Number(formValues.payoutPercentage)
  const setPercentage = (value: number) =>
    setValue('payoutPercentage', value, {
      shouldValidate: true,
      shouldDirty: true,
    })

  const formatRune = (amount: number) =>
    formatAmount(amount, { ticker: coin.ticker })

  return (
    <VStack gap={14}>
      <Text size={14} color="shy">
        {t('rewards_payout_description')}
      </Text>

      <VStack gap={8}>
        <Text size={14} weight="500" color="shyExtra">
          {t('payout_asset')}
        </Text>
        <Card>
          <HStack gap={12} alignItems="center">
            <CoinIcon coin={coin} style={{ fontSize: 36 }} />
            <VStack gap={2}>
              <Text size={16} weight="500" color="contrast">
                {coin.ticker}
              </Text>
              <Text size={12} weight="500" color="shy">
                {coin.chain}
              </Text>
            </VStack>
          </HStack>
        </Card>
      </VStack>

      <PercentageCard gap={14}>
        <HStack justifyContent="space-between" alignItems="center">
          <Text size={14} weight="500" color="shyExtra">
            {t('payout_percentage')}
          </Text>
          <PercentageValue>{percentage}%</PercentageValue>
        </HStack>
        <Slider value={percentage} onChange={setPercentage} />
        <HStack gap={12}>
          {payoutShortcuts.map(share => (
            <Shortcut
              key={share}
              value={share}
              isActive={percentage === share * 100}
              onClick={() => setPercentage(share * 100)}
            />
          ))}
        </HStack>
        <Text size={12} weight="500" color="shy">
          {percentage === 0
            ? t('rewards_payout_caption_none')
            : t('rewards_payout_caption', { percentage })}
        </Text>
      </PercentageCard>

      <NodeInfo gap={12}>
        <BondYieldInfoRow label={t('node_address')}>
          {formatWalletAddress(String(formValues.nodeAddress))}
        </BondYieldInfoRow>
        <BondYieldInfoRow label={t('bonded')}>
          {formatRune(
            fromChainAmount(
              BigInt(String(formValues.bondedAmount)),
              coin.decimals
            )
          )}
        </BondYieldInfoRow>
        <BondYieldInfoRow label={t('next_reward')}>
          {formatRune(Number(formValues.nextReward))}
        </BondYieldInfoRow>
      </NodeInfo>
    </VStack>
  )
}

const Card = styled.div`
  padding: 10px 12px;
  ${borderRadius.xl};
  border: 1px solid ${getColor('foregroundExtra')};
  background: ${getColor('foreground')};
`

const PercentageCard = styled(VStack)`
  padding: 14px 16px;
  ${borderRadius.xl};
  border: 1px solid ${getColor('foregroundExtra')};
  background: ${getColor('foreground')};
`

const PercentageValue = styled.span`
  font-family: Satoshi, sans-serif;
  font-size: 28px;
  font-weight: 500;
  line-height: 34px;
  letter-spacing: -0.56px;
  color: ${getColor('text')};
`

const Shortcut = styled(AmountSuggestion)`
  flex: 1;
  height: auto;
  padding: 4px 16px;
  ${borderRadius.pill};
  border: 1px solid ${getColor('foregroundExtra')};
`

const NodeInfo = styled(VStack)`
  padding: 6px 8px;
`
