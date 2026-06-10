import { useCosmosDelegationsQuery } from '@core/ui/chain/cosmos/staking/queries/useCosmosDelegationsQuery'
import { useCosmosValidatorsQuery } from '@core/ui/chain/cosmos/staking/queries/useCosmosValidatorsQuery'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { StakingChain } from '@vultisig/core-chain/chains/cosmos/staking/lcdQueries'
import {
  type Delegation,
  type Validator,
} from '@vultisig/core-chain/chains/cosmos/staking/lcdQueries'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ValidatorAvatar } from './ValidatorAvatar'

type ActiveDelegationPickerProps = {
  chain: StakingChain
  delegatorAddress: string
  /** Staking-token ticker (LUNA / LUNC). */
  ticker: string
  decimals: number
  /** Section heading; defaults to "Select Delegation". */
  title?: string
  onSelect: (input: { validator: Validator; delegation: Delegation }) => void
}

/**
 * Inline picker that lists the user's active delegations on a Cosmos chain
 * and resolves the chosen valoper before handing off to the parent form.
 *
 * Used as the entry-point step for cosmos staking actions reached without
 * a pre-selected delegation (e.g. Wallet → Function → Undelegate /
 * Redelegate, where the DeFi-page card flow would have pre-filled the
 * source validator). On the DeFi-page entry the picker is skipped — the
 * card already supplies `validatorAddress` / `srcValidatorAddress` via
 * the form-defaults.
 */
export const ActiveDelegationPicker = ({
  chain,
  delegatorAddress,
  ticker,
  decimals,
  title,
  onSelect,
}: ActiveDelegationPickerProps) => {
  const { t } = useTranslation()
  const delegationsQuery = useCosmosDelegationsQuery({
    chain,
    delegatorAddress,
  })
  const validatorsQuery = useCosmosValidatorsQuery(chain)

  return (
    <VStack gap={16}>
      <Text size={15} weight="500">
        {title ?? t('select_delegation')}
      </Text>
      <MatchQuery
        value={delegationsQuery}
        pending={() => (
          <HStack justifyContent="center">
            <Spinner />
          </HStack>
        )}
        error={() => (
          <Text color="danger">{t('failed_to_load_delegations')}</Text>
        )}
        success={delegations => {
          if (delegations.length === 0) {
            return (
              <EmptyState>
                <Text size={14} color="shy">
                  {t('no_active_delegations')}
                </Text>
              </EmptyState>
            )
          }
          // Without validator metadata each delegation row falls back to
          // `null` (no moniker / avatar / id to render), so the user sees
          // an empty list and assumes no positions. Surface the validator
          // query's own loading / error state instead.
          if (validatorsQuery.isPending) {
            return (
              <HStack justifyContent="center">
                <Spinner />
              </HStack>
            )
          }
          if (validatorsQuery.isError) {
            return <Text color="danger">{t('failed_to_load_validators')}</Text>
          }
          const validators = validatorsQuery.data ?? []
          const validatorByAddr = new Map(
            validators.map(v => [v.operatorAddress, v])
          )
          return (
            <VStack gap={8}>
              {delegations.map(d => {
                const validator = validatorByAddr.get(d.validatorAddress)
                if (!validator) return null
                const staked = fromChainAmount(
                  BigInt(d.balance.amount),
                  decimals
                )
                return (
                  <Row
                    key={d.validatorAddress}
                    onClick={() => onSelect({ validator, delegation: d })}
                  >
                    <ValidatorAvatar
                      moniker={validator.description.moniker}
                      identity={validator.description.identity}
                    />
                    <VStack gap={2} flexGrow>
                      <Text size={15} weight="500">
                        {validator.description.moniker ||
                          t('unnamed_validator')}
                      </Text>
                      <Text size={12} color="shy">
                        {staked} {ticker}
                      </Text>
                    </VStack>
                  </Row>
                )
              })}
            </VStack>
          )
        }}
      />
    </VStack>
  )
}

const Row = styled.button.attrs({ type: 'button' as const })`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: ${getColor('foreground')};
  border: 1px solid transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  width: 100%;

  &:hover {
    background: ${getColor('foregroundExtra')};
  }

  &:focus-visible {
    outline: 2px solid ${getColor('primary')};
    outline-offset: 2px;
  }
`

const EmptyState = styled(VStack)`
  padding: 24px;
  align-items: center;
  justify-content: center;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
`
