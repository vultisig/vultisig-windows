import { Match } from '@lib/ui/base/Match'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { CreateReferralForm } from './components/CreateReferralForm'
import { EditReferralForm } from './components/EditReferralForm'
import { ManageReferralsForm } from './components/ManageReferralsForm'
import { ReferralPageWrapper } from './components/Referrals.styled'

export const ManageReferralsPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  const [uiState, setUiState] = useState<
    'default' | 'create' | 'edit' | 'loading'
  >('default')

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
            <ManageReferralsForm
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
