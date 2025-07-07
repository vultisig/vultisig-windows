import { Match } from '@lib/ui/base/Match'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { CreateOrSaveReferralSelectionForm } from './components/CreateOrSaveReferralSelectionForm'
import { CreateReferralForm } from './components/CreateReferralForm'
import { EditReferralForm } from './components/EditReferralForm'
import { ReferralPageWrapper } from './components/Referrals.styled'

export const CreateOrSaveReferralPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  const [uiState, setUiState] = useState<
    'default' | 'create' | 'edit' | 'loading'
  >('default')

  // TODO: needs conditional rendering
  // 1) if the user's THORchain address has an associated name with it, we should show the EDIT referral screen
  // 2) if the user's THORchain address has no associated name with it, we should show this landing screen
  //  2.1) from here they can either input a referral and save it
  //  2.2) or they can create a referral and save it

  return (
    <>
      {uiState !== 'loading' && (
        <PageHeader
          primaryControls={<PageHeaderBackButton />}
          title={t('title_1')}
        />
      )}
      <ReferralPageWrapper>
        <Match
          value={uiState}
          default={() => (
            <CreateOrSaveReferralSelectionForm
              onSaveReferral={() => {
                // TODO: save referral
                setUiState('loading')
                setTimeout(
                  () =>
                    navigate({
                      id: 'vault',
                    }),
                  2000
                )
              }}
              onCreateReferral={() => setUiState('create')}
            />
          )}
          create={() => <CreateReferralForm />}
          edit={() => <EditReferralForm />}
          loading={() => (
            <CenterAbsolutely>
              <Spinner size="3em" />
            </CenterAbsolutely>
          )}
        />
      </ReferralPageWrapper>
    </>
  )
}
