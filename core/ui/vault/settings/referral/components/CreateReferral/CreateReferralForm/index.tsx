import { SettingsCtaButton } from '@core/ui/settings/SettingsCtaButton'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { InfoCircleIcon } from '@lib/ui/icons/InfoCircleIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { StackSeparatedBy } from '@lib/ui/layout/StackSeparatedBy'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { useFormState, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCanAffordReferral } from '../../../hooks/useCanAffordReferral'
import { useCreateReferralForm } from '../../../providers/CreateReferralFormProvider'
import {
  DecorationLine,
  FormFieldErrorText,
  ReferralFormContent,
  ReferralFormFooter,
} from '../../Referrals.styled'
import { ExpirationField } from './Fields/ExpirationField'
import { Fees } from './Fields/Fees'
import { ReferralCodeField } from './Fields/ReferralCodeField'

type CreateReferralFormProps = OnFinishProp & OnBackProp

/**
 * Form for registering the vault's own THORName referral code. Header back
 * hands control to `onBack` so the parent referral view can close this screen.
 */
export const CreateReferralForm = ({
  onFinish,
  onBack,
}: CreateReferralFormProps) => {
  const { t } = useTranslation()

  const { control } = useCreateReferralForm()
  const { isValid, isSubmitting } = useFormState({ control })
  const feeAmount = useWatch({ control, name: 'referralFeeAmount' })

  const canAfford = useCanAffordReferral(feeAmount)
  const error = canAfford ? undefined : t('insufficient_balance')

  return (
    <VStack flexGrow>
      <SettingsPageHeader
        onBack={onBack}
        secondaryControls={
          <Tooltip
            renderOpener={({ ref }) => (
              <div ref={ref}>
                <InfoButton size="sm">
                  <InfoCircleIcon />
                </InfoButton>
              </div>
            )}
            content={
              <TooltipContent>
                <Text height={24 / 16} size={16} weight={500}>
                  {t('header_tooltip_title')}
                </Text>
                <Text color="shy" variant="footnote">
                  {t('header_tooltip_content')}
                </Text>
              </TooltipContent>
            }
          />
        }
        title={t('create_referral_title')}
      />
      <VStack
        onSubmit={onFinish}
        as="form"
        data-testid="CreateReferralForm-Wrapper"
        flexGrow
        style={{ minHeight: 0 }}
      >
        <ReferralFormContent flexGrow scrollable>
          <StackSeparatedBy
            direction="column"
            separator={<DecorationLine />}
            gap={14}
          >
            <ReferralCodeField />
            <ExpirationField />
            <Fees />
          </StackSeparatedBy>
        </ReferralFormContent>
        <ReferralFormFooter gap={4}>
          <SettingsCtaButton
            disabled={!isValid || isSubmitting || Boolean(error)}
            type="submit"
          >
            {t('create_referral')}
          </SettingsCtaButton>
          {error && <FormFieldErrorText>{error}</FormFieldErrorText>}
        </ReferralFormFooter>
      </VStack>
    </VStack>
  )
}

const InfoButton = styled(IconButton)`
  font-size: 20px;
  margin-right: -4px;
`

const TooltipContent = styled.div`
  min-width: 272px;
`
