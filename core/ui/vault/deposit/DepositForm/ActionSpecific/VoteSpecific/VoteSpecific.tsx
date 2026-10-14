import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { RadioInput } from '@lib/ui/inputs/RadioInput'
import { Text } from '@lib/ui/text'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useDepositFormHandlers } from '../../../providers/DepositFormHandlersProvider'
import { govVoteOptions } from '../../../vote/govVoteOption'
import { useGovVoteOptionLabels } from './useGovVoteOptionLabels'

/**
 * The dYdX governance ballot picker. Nothing is preselected, so a vote is
 * never cast for an option the user did not choose.
 */
export const VoteSpecific = () => {
  const { t } = useTranslation()
  const [{ setValue, control }] = useDepositFormHandlers()
  const option = useWatch({ control, name: 'option' })
  const optionLabels = useGovVoteOptionLabels()

  return (
    <InputContainer>
      <Text size={15} weight="400">
        {t('chainFunctions.vote.labels.option')}{' '}
        <Text as="span" color="danger" size={14}>
          *
        </Text>
      </Text>
      <RadioInput
        // Four options overflow a single row at popup width.
        style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
        value={isOneOf(option, govVoteOptions) ? option : null}
        onChange={value => setValue('option', value, { shouldValidate: true })}
        options={govVoteOptions}
        renderOption={value => optionLabels[value]}
      />
    </InputContainer>
  )
}
