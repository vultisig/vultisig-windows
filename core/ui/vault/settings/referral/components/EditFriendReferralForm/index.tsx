import { SettingsStrongCtaButton } from '@core/ui/settings/SettingsCtaButton'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { Match } from '@lib/ui/base/Match'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { OnFinishProp } from '@lib/ui/props'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAssertCurrentVaultId } from '../../../../../storage/currentVaultId'
import {
  useFriendReferralQuery,
  useSetFriendReferralMutation,
} from '../../../../../storage/referrals'
import { ReferralFormContent, ReferralFormFooter } from '../Referrals.styled'
import { ReferralCodeField } from './Fields/ReferralCodeField'
import { useFriendReferralValidation } from './hooks/useFriendReferralValidation'

export const EditFriendReferralForm = ({ onFinish }: OnFinishProp) => {
  const [referralName, setReferralName] = useState('')
  const currentVaultId = useAssertCurrentVaultId()
  const { mutateAsync: setFriendReferral } =
    useSetFriendReferralMutation(currentVaultId)
  const { data: friendReferral, isLoading } =
    useFriendReferralQuery(currentVaultId)

  const { t } = useTranslation()

  const { error, isPending: isValidating } =
    useFriendReferralValidation(referralName)

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
        <VStack flexGrow>
          <SettingsPageHeader
            onBack={() => onFinish()}
            title={t('save_referral')}
          />
          <ReferralFormContent flexGrow scrollable>
            <ReferralCodeField
              value={referralName}
              onChange={setReferralName}
              error={error}
            />
          </ReferralFormContent>
          <ReferralFormFooter>
            <SettingsStrongCtaButton
              onClick={() => {
                setFriendReferral(referralName)
                onFinish()
              }}
              disabled={Boolean(error) || isValidating}
              type="submit"
            >
              {t('save_referral')}
            </SettingsStrongCtaButton>
          </ReferralFormFooter>
        </VStack>
      )}
    />
  )
}
