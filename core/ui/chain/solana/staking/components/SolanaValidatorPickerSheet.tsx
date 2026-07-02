import { useSolanaValidatorsQuery } from '@core/ui/chain/solana/staking/queries/useSolanaValidatorsQuery'
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
import { solDecimals } from '@vultisig/core-chain/chains/solana/staking/config'
import {
  SolanaValidator,
  validatorDisplayName,
  validatorLogoUrl,
} from '@vultisig/core-chain/chains/solana/staking/models/validator'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { ChangeEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { SolanaValidatorAvatar } from './SolanaValidatorAvatar'

type SolanaValidatorPickerSheetProps = {
  ticker: string
  /** Currently-selected vote pubkey, when re-opening to swap selection. */
  selectedVotePubkey?: string
  /** Optional source validator to hide from the list (e.g. move dst picker). */
  excludeVotePubkey?: string
  onClose: () => void
  onSelect: (validator: SolanaValidator) => void
}

/**
 * Bottom-sheet validator picker for the Solana delegate / move forms. Lists the
 * active validators (`getVoteAccounts`, searchable, enriched with name/logo via
 * the metadata seam), highlights the current selection, and optionally excludes
 * one validator. Mirrors iOS `SolanaValidatorSelectionScreen`.
 */
export const SolanaValidatorPickerSheet = ({
  ticker,
  selectedVotePubkey,
  excludeVotePubkey,
  onClose,
  onSelect,
}: SolanaValidatorPickerSheetProps) => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [picked, setPicked] = useState<string | undefined>(selectedVotePubkey)

  const query = useSolanaValidatorsQuery()

  const filter = (validators: SolanaValidator[]) => {
    const needle = search.trim().toLowerCase()
    return validators
      .filter(v => !v.isDelinquent && v.epochVoteAccount)
      .filter(v => v.votePubkey !== excludeVotePubkey)
      .filter(v => {
        if (!needle) return true
        return (
          validatorDisplayName(v).toLowerCase().includes(needle) ||
          v.votePubkey.toLowerCase().includes(needle)
        )
      })
      .sort((a, b) => {
        if (b.activatedStake === a.activatedStake) return 0
        return b.activatedStake > a.activatedStake ? 1 : -1
      })
  }

  const handleConfirm = () => {
    if (!picked) return
    const validator = query.data?.find(v => v.votePubkey === picked)
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
                    const isSelected = picked === v.votePubkey
                    return (
                      <ValidatorRow
                        key={v.votePubkey}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onClick={() => setPicked(v.votePubkey)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setPicked(v.votePubkey)
                          }
                        }}
                        $selected={isSelected}
                      >
                        <SolanaValidatorAvatar
                          name={validatorDisplayName(v)}
                          logoUrl={validatorLogoUrl(v)}
                        />
                        <VStack gap={2} flexGrow>
                          <Text size={15} weight="500">
                            {validatorDisplayName(v)}
                          </Text>
                          <Text size={12} color="shy">
                            {formatAmount(
                              fromChainAmount(v.activatedStake, solDecimals),
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
                          {`${v.commission}%`}
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
