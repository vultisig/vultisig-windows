import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { Match } from '@lib/ui/base/Match'
import { Button } from '@lib/ui/buttons/Button'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { VStack } from '@lib/ui/layout/Stack'
import { StackSeparatedBy } from '@lib/ui/layout/StackSeparatedBy'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  useFriendReferralQuery,
  useSetFriendReferralMutation,
} from '../../../../../storage/referrals'
import { DecorationLine, ReferralPageWrapper } from '../Referrals.styled'
import { ReferralCodeField } from './Fields/ReferralCodeField'
type Props = {
  userReferralName?: string
} & OnFinishProp

export const EditFriendReferralForm = ({
  onFinish,
  userReferralName,
}: Props) => {
  const [referralName, setReferralName] = useState('')
  const { mutateAsync: setFriendReferral } = useSetFriendReferralMutation()
  const { data: friendReferral, isLoading } = useFriendReferralQuery()

  const { t } = useTranslation()

  const error =
    referralName.toLowerCase() === userReferralName?.toLocaleLowerCase()
      ? t('used_referral_error')
      : undefined

  useEffect(() => {
    if (friendReferral) {
      setReferralName(friendReferral)
    }
  }, [friendReferral])

  return (
    <Match
      value={isLoading ? 'loading' : 'success'}
      loading={() => (
        <CenterAbsolutely>
          <Spinner size="3em" />
        </CenterAbsolutely>
      )}
      success={() => (
        <VStack flexGrow gap={40}>
          <PageHeader
            primaryControls={
              <PageHeaderBackButton onClick={() => onFinish()} />
            }
            title={t('title_1')}
          />
          <ReferralPageWrapper flexGrow justifyContent="space-between">
            <VStack flexGrow justifyContent="space-between">
              <StackSeparatedBy
                direction="column"
                separator={<DecorationLine />}
                gap={14}
              >
                <ReferralCodeField
                  value={referralName}
                  onChange={setReferralName}
                  error={error}
                />
              </StackSeparatedBy>
              <Button
                onClick={() => {
                  setFriendReferral(referralName)
                  onFinish()
                }}
                disabled={Boolean(error)}
                type="submit"
              >
                {t('save_code')}
              </Button>
            </VStack>
          </ReferralPageWrapper>
        </VStack>
      )}
    />
  )
}
