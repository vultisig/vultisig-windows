import { ValidatorAvatar } from '@core/ui/chain/cosmos/staking/components/ValidatorAvatar'
import { useTonStakingPoolsQuery } from '@core/ui/chain/ton/staking/queries/useTonStakingPoolsQuery'
import { SearchInput } from '@core/ui/vault/chain/manage/shared/SearchInput'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { ShieldCheckFilledIcon } from '@lib/ui/icons/ShieldCheckFilledIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { TonStakingPool } from '@vultisig/core-chain/chains/ton/staking'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type TonPoolPickerProps = {
  /** Native TON ticker for the min-stake subline. */
  ticker: string
  /** Native TON decimals, for scaling `minStake` to human TON. */
  decimals: number
  selectedAddress?: string
  onSelect: (pool: TonStakingPool) => void
  onClose: () => void
}

const Row = styled.button.attrs({ type: 'button' })<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border-radius: 16px;
  cursor: pointer;
  background: ${getColor('foreground')};
  border: 1px solid
    ${({ isSelected }) =>
      isSelected ? getColor('primary') : getColor('foregroundExtra')};

  &:hover {
    border-color: ${getColor('primary')};
  }
`

const VerifiedIcon = styled(ShieldCheckFilledIcon)`
  color: ${getColor('primary')};
  font-size: 14px;
`

const SelectedIcon = styled(CheckIcon)`
  color: ${getColor('success')};
  font-size: 16px;
`

/**
 * Modal pool picker for the TON first-time-stake flow. Lists stakeable
 * nominator pools (verified `whales`/`tf` with capacity, APY-sorted) with a
 * search field, mirroring iOS `TonPoolSelectionScreen`. In practice only Whales
 * pools are accessible (min ~50 TON).
 */
export const TonPoolPicker = ({
  ticker,
  decimals,
  selectedAddress,
  onSelect,
  onClose,
}: TonPoolPickerProps) => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const { data: pools, isPending, error } = useTonStakingPoolsQuery()

  const normalizedSearch = search.trim().toLowerCase()
  const filteredPools = (pools ?? []).filter(
    pool =>
      !normalizedSearch ||
      pool.name.toLowerCase().includes(normalizedSearch) ||
      pool.address.toLowerCase().includes(normalizedSearch)
  )

  return (
    <Modal onClose={onClose} title={t('ton_stake_select_pool')}>
      <VStack gap={12}>
        <SearchInput value={search} onChange={setSearch} />
        <HStack justifyContent="space-between" style={{ padding: '0 14px' }}>
          <Text size={12} color="shy">
            {t('ton_stake_pool_picker_header')}
          </Text>
          <Text size={12} color="shy">
            {t('apr')}
          </Text>
        </HStack>

        {isPending ? (
          <HStack justifyContent="center">
            <Spinner />
          </HStack>
        ) : error ? (
          <HStack justifyContent="center">
            <Text color="danger">{t('failed_to_load')}</Text>
          </HStack>
        ) : filteredPools.length === 0 ? (
          <HStack justifyContent="center">
            <Text color="shy">{t('ton_stake_no_pools')}</Text>
          </HStack>
        ) : (
          <VStack gap={8}>
            {filteredPools.map(pool => (
              <Row
                key={pool.address}
                isSelected={pool.address === selectedAddress}
                onClick={() => onSelect(pool)}
              >
                <ValidatorAvatar moniker={pool.name} size={36} />
                <VStack gap={2} alignItems="start" flexGrow>
                  <HStack gap={4} alignItems="center">
                    <Text size={14} weight="500" color="contrast">
                      {pool.name}
                    </Text>
                    {pool.verified ? <VerifiedIcon /> : null}
                  </HStack>
                  <Text size={12} color="shy">
                    {t('ton_stake_min', {
                      amount: formatAmount(
                        Number(fromChainAmount(pool.minStake, decimals))
                      ),
                    })}{' '}
                    {ticker}
                  </Text>
                </VStack>
                <Text size={14} weight="500" color="success">
                  {pool.apy.toFixed(2)}%
                </Text>
                {pool.address === selectedAddress ? <SelectedIcon /> : null}
              </Row>
            ))}
          </VStack>
        )}
      </VStack>
    </Modal>
  )
}
