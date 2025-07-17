import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { StackSeparatedBy } from '@lib/ui/layout/StackSeparatedBy'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { OnFinishProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { useEditReferralFormData } from '../../providers/EditReferralFormProvider'
import { DecorationLine, ReferralPageWrapper } from '../Referrals.styled'
import { ExpirationField } from './Fields/ExpirationField'
import { Fees } from './Fields/Fees'
import { PayoutAssetField } from './Fields/PayoutAssetField'
import { ReferralCodeField } from './Fields/ReferralCodeField'

export const EditReferralForm = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()

  const {
    formState: { isValid, isSubmitting },
  } = useEditReferralFormData()

  return (
    <VStack flexGrow gap={40}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('title_1')}
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
            <PayoutAssetField />
            <ExpirationField />
            <Fees />
          </StackSeparatedBy>
          <Button disabled={!isValid || isSubmitting} type="submit">
            {t('create_referral_form')}
          </Button>
        </VStack>
      </ReferralPageWrapper>
    </VStack>
  )
}
