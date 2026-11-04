import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { InputProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { Trans, useTranslation } from 'react-i18next'

import {
  FormField,
  FormFieldErrorText,
  ReferralTextInput,
} from '../../Referrals.styled'

export const ReferralCodeField = ({
  value,
  onChange,
  error,
}: InputProps<string> & {
  error?: string
}) => {
  const { t } = useTranslation()

  return (
    <FormField>
      <SettingsBaselineText
        as="label"
        color="shyExtra"
        height={20 / 15}
        htmlFor="referral-name"
        size={15}
        weight={500}
      >
        <Trans
          i18nKey="save_swap_fees_with_referral"
          components={{
            blue: <Text as="span" color="primaryAlt" size={15} weight={500} />,
          }}
        />
      </SettingsBaselineText>
      <ReferralTextInput
        id="referral-name"
        value={value}
        placeholder={t('enter_up_to_4_characters_placeholder')}
        validation={error ? 'invalid' : undefined}
        onValueChange={onChange}
      />
      {error && <FormFieldErrorText>{error}</FormFieldErrorText>}
    </FormField>
  )
}
