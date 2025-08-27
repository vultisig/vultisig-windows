import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { InfoIcon } from '@lib/ui/icons/InfoIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { StackSeparatedBy } from '@lib/ui/layout/StackSeparatedBy'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCanAffordReferral } from '../../../hooks/useCanAffordReferral'
import { useCreateReferralForm } from '../../../providers/CreateReferralFormProvider'
import {
  DecorationLine,
  FormFieldErrorText,
  ReferralPageWrapper,
} from '../../Referrals.styled'
import { ExpirationField } from './Fields/ExpirationField'
import { Fees } from './Fields/Fees'
import { ReferralCodeField } from './Fields/ReferralCodeField'

export const CreateReferralForm = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()

  const {
    watch,
    formState: { isValid, isSubmitting },
  } = useCreateReferralForm()
  const feeAmount = watch('referralFeeAmount')

  const canAfford = useCanAffordReferral(feeAmount)
  const error = canAfford ? undefined : t('insufficient_balance')

  return (
    <VStack flexGrow gap={40}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <Tooltip
            renderOpener={({ ref }) => (
              <div ref={ref}>
                <IconButton size="sm">
                  <InfoIcon />
                </IconButton>
              </div>
            )}
            content={
              <TooltipContent>
                <Text size={16}>{t('header_tooltip_title')}</Text>
                <Text color="supporting" size={13}>
                  {t('header_tooltip_content')}
                </Text>
              </TooltipContent>
            }
          />
        }
        title={t('create_referral_title')}
      />
      <ReferralPageWrapper
        onSubmit={onFinish}
        as="form"
        data-testid="CreateReferralForm-Wrapper"
        flexGrow
        justifyContent="space-between"
      >
        <VStack flexGrow justifyContent="space-between">
          <StackSeparatedBy
            direction="column"
            separator={<DecorationLine />}
            gap={14}
          >
            <ReferralCodeField />
            <ExpirationField />
            <Fees />
          </StackSeparatedBy>
          <VStack gap={4}>
            <Button
              disabled={!isValid || isSubmitting || Boolean(error)}
              type="submit"
            >
              {t('create_referral_form')}
            </Button>
            {error && <FormFieldErrorText>{error}</FormFieldErrorText>}
          </VStack>
        </VStack>
      </ReferralPageWrapper>
    </VStack>
  )
}

const TooltipContent = styled.div`
  min-width: 200px;
`
