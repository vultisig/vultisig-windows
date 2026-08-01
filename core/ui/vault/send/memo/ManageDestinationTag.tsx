import { AnimatedSendFormInputError } from '@core/ui/vault/send/components/AnimatedSendFormInputError'
import { useSendValidationQuery } from '@core/ui/vault/send/queries/useSendValidationQuery'
import {
  useSendDestinationTag,
  useSendDestinationTagInput,
} from '@core/ui/vault/send/state/destinationTag'
import { useCurrentSendCoin } from '@core/ui/vault/send/state/sendCoin'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Chain } from '@vultisig/core-chain/Chain'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const ManageDestinationTag = () => {
  const { t } = useTranslation()
  const { chain } = useCurrentSendCoin()
  const [, setValue] = useSendDestinationTagInput()
  const { isLocked, value } = useSendDestinationTag()
  const { data } = useSendValidationQuery()
  const error = data?.destinationTag

  if (chain !== Chain.Ripple) return null

  return (
    <VStack gap={4}>
      <InputLabel>{t('ripple_field_destination_tag')}</InputLabel>
      <StyledTextInput
        aria-label={t('ripple_field_destination_tag')}
        data-testid="send-destination-tag-input"
        disabled={isLocked}
        inputMode="numeric"
        placeholder={t('ripple_destination_tag_optional')}
        validation={error ? 'warning' : undefined}
        value={value}
        onValueChange={setValue}
      />
      {error && <AnimatedSendFormInputError error={error} />}
    </VStack>
  )
}

const StyledTextInput = styled(TextInput)`
  font-size: 16px;
  font-weight: 500;

  &::placeholder {
    font-size: 16px;
    font-weight: 500;
  }
`
