import { Match } from '@lib/ui/base/Match'
import { Button } from '@lib/ui/buttons/Button'
import { TextInput } from '@lib/ui/inputs/TextInput'
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
import { useState } from 'react'
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
      <VStack gap={16}>
        <TextInput
          placeholder={t('search')}
          value={search}
          onValueChange={setSearch}
        />
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
                  {filtered.map(v => (
                    <ValidatorRow
                      key={v.operatorAddress}
                      onClick={() => setPicked(v.operatorAddress)}
                      $selected={picked === v.operatorAddress}
                    >
                      <ValidatorAvatar moniker={v.description.moniker} />
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
                      <Match
                        value={picked === v.operatorAddress ? 'on' : 'off'}
                        on={() => (
                          <Text size={14} color="primary" weight="500">
                            {formatCommission(v.commission.rate)}
                          </Text>
                        )}
                        off={() => (
                          <Text size={14} color="regular">
                            {formatCommission(v.commission.rate)}
                          </Text>
                        )}
                      />
                    </ValidatorRow>
                  ))}
                </VStack>
              </ScrollList>
            )
          }}
        />
      </VStack>
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

const ScrollList = styled.div`
  max-height: 480px;
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
  border: 1px solid
    ${({ $selected }) => ($selected ? getColor('primary') : 'transparent')};

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`
