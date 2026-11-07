import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import {
  settingsFieldSurface,
  settingsInputHeight,
} from '@core/ui/settings/settingsField'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CopiesFilledIcon } from '@lib/ui/icons/CopiesFilledIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { useTranslation } from 'react-i18next'
import { useCopyToClipboard } from 'react-use'
import styled from 'styled-components'

import { useUserValidThorchainNameQuery } from '../../../../queries/useUserValidThorchainNameQuery'
import { FormField } from '../../../Referrals.styled'

/** Edit Referral's read-only code, with a copy action. */
export const ReferralCodeField = () => {
  const { data: nameDetails } = useUserValidThorchainNameQuery()
  const [, copyToClipboard] = useCopyToClipboard()
  const { t } = useTranslation()

  return (
    <FormField>
      <SettingsBaselineText color="shy" variant="stationBodyS">
        {t('your_referral_code')}
      </SettingsBaselineText>
      <FieldWrapper>
        <SettingsBaselineText variant="stationBodyS">
          {nameDetails?.name}
        </SettingsBaselineText>
        <UnstyledButton
          onClick={() => copyToClipboard(nameDetails?.name || '')}
        >
          <IconWrapper size={20}>
            <CopiesFilledIcon />
          </IconWrapper>
        </UnstyledButton>
      </FieldWrapper>
    </FormField>
  )
}

const FieldWrapper = styled.div`
  ${settingsFieldSurface};
  align-items: center;
  display: flex;
  justify-content: space-between;
  min-height: ${settingsInputHeight}px;
  padding: 0 15px;
`
