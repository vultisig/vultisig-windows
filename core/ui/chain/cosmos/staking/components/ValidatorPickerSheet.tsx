import { Button } from '@lib/ui/buttons/Button'
import { CircleCheckIcon } from '@lib/ui/icons/CircleCheckIcon'
import { SearchIcon } from '@lib/ui/icons/SearchIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Modal } from '@lib/ui/modal'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { IbcEnabledCosmosChain } from '@vultisig/core-chain/Chain'
import { type Validator } from '@vultisig/core-chain/chains/cosmos/staking/lcdQueries'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { ChangeEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCosmosValidatorsQuery } from '../queries/useCosmosValidatorsQuery'
import { ValidatorAvatar } from './ValidatorAvatar'

type ValidatorPickerSheetProps = {
  chain: IbcEnabledCosmosChain
  /** Native staking-token ticker shown for voting power, e.g. `LUNA`. */
  ticker: string
  /** Base-unit exponent of the staking token (Terra/TerraClassic = 6). */
  decimals: number
  /** Currently-selected valoper, when re-opening to swap selection. */
  selectedValidatorAddress?: string
  /** Optional source validator to hide from the list (e.g. redelegate dst picker). */
  excludeValidatorAddress?: string
  onClose: () => void
  onSelect: (validator: Validator) => void
}

export const ValidatorPickerSheet = ({
  chain,
  ticker,
  decimals,
  selectedValidatorAddress,
  excludeValidatorAddress,
  onClose,
  onSelect,
}: ValidatorPickerSheetProps) => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [picked, setPicked] = useState<string | undefined>(
    selectedValidatorAddress
  )

  const query = useCosmosValidatorsQuery(chain)

  const filter = (validators: Validator[]) => {
    const needle = search.trim().toLowerCase()
    return validators
      .filter(v => v.operatorAddress !== excludeValidatorAddress)
      .filter(v => {
        if (!needle) return true
        return (
          v.description.moniker.toLowerCase().includes(needle) ||
          v.operatorAddress.toLowerCase().includes(needle)
        )
      })
      .sort((a, b) => Number(BigInt(b.tokens) - BigInt(a.tokens)))
  }

  const handleConfirm = () => {
    if (!picked) return
    const validator = query.data?.find(v => v.operatorAddress === picked)
    if (!validator) return
    onSelect(validator)
  }

  return (
    <Modal
      onClose={onClose}
      title={t('select_validator')}
      withDefaultStructure
      footer={
        <Button disabled={!picked} onClick={handleConfirm}>
          {t('select_validator')}
        </Button>
      }
    >
      <Layout>
        <SearchWrapper>
          <SearchIconBox>
            <SearchIcon />
          </SearchIconBox>
          <SearchInputEl
            type="text"
            placeholder={t('search')}
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
          />
        </SearchWrapper>
        <MatchQuery
          value={query}
          pending={() => (
            <HStack justifyContent="center" alignItems="center">
              <Spinner />
            </HStack>
          )}
          error={() => (
            <Text color="danger">{t('failed_to_load_validators')}</Text>
          )}
          success={validators => {
            const filtered = filter(validators)
            return (
              <ScrollList>
                <VStack gap={8}>
                  {filtered.map(v => {
                    const isSelected = picked === v.operatorAddress
                    return (
                      <ValidatorRow
                        key={v.operatorAddress}
                        onClick={() => setPicked(v.operatorAddress)}
                        $selected={isSelected}
                      >
                        <ValidatorAvatar
                          moniker={v.description.moniker}
                          identity={v.description.identity}
                        />
                        <VStack gap={2} flexGrow>
                          <Text size={15} weight="500">
                            {v.description.moniker || 'Unnamed'}
                          </Text>
                          <Text size={12} color="shy">
                            {formatAmount(
                              fromChainAmount(BigInt(v.tokens), decimals),
                              { ticker }
                            )}
                          </Text>
                        </VStack>
                        {isSelected ? (
                          <SelectedCheck>
                            <CircleCheckIcon />
                          </SelectedCheck>
                        ) : null}
                        <Text size={14} color="regular">
                          {formatCommission(v.commission.rate)}
                        </Text>
                      </ValidatorRow>
                    )
                  })}
                </VStack>
              </ScrollList>
            )
          }}
        />
      </Layout>
    </Modal>
  )
}

/**
 * Cosmos commission rate is an 18-decimal Dec string (e.g. "0.05" => 5%).
 * Render with at most two decimal places.
 */
const formatCommission = (rateDec: string): string => {
  const n = Number(rateDec)
  if (!Number.isFinite(n)) return '—'
  return `${(n * 100).toFixed(2)}%`
}

const SearchWrapper = styled.div`
  position: relative;
  background: ${getColor('foreground')};
  border-radius: 999px;
  height: 48px;
  display: flex;
  align-items: center;
`

const SearchIconBox = styled.div`
  position: absolute;
  left: 16px;
  display: flex;
  align-items: center;
  color: ${getColor('textShy')};
  font-size: 18px;
  pointer-events: none;
`

const SearchInputEl = styled.input`
  width: 100%;
  height: 100%;
  padding: 0 16px 0 44px;
  background: transparent;
  border: none;
  outline: none;
  color: ${getColor('text')};
  font-size: 15px;

  &::placeholder {
    color: ${getColor('textShy')};
  }
`

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  min-height: 0;
  /* Modal capping content height — let the sheet fill the available viewport
   * minus header/footer/padding. The browser-default scrollbar lives inside
   * ScrollList below. */
  height: min(calc(100vh - 220px), 720px);
`

const ScrollList = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`

const ValidatorRow = styled(HStack)<{ $selected: boolean }>`
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: ${({ $selected }) =>
    $selected ? getColor('foregroundExtra') : getColor('foreground')};
  cursor: pointer;
  border: 1px solid transparent;

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`

const SelectedCheck = styled.div`
  color: ${getColor('success')};
  display: flex;
  align-items: center;
  font-size: 18px;
`
