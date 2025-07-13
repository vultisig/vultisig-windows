import { Match } from '@lib/ui/base/Match'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { useState } from 'react'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { CreateReferralForm } from './components/CreateReferralForm'
import { CreateReferralVerify } from './components/CreateReferralVerify'
import { EditReferralForm } from './components/EditReferralForm'
import { ManageReferralsForm } from './components/ManageReferralsForm'
import { CreateReferralFormProvider } from './provders/CreateReferralFormProvider'
import { ReferralPayoutAssetProvider } from './provders/ReferralPayoutAssetProvider'

export const ManageReferralsPage = () => {
  const navigate = useCoreNavigate()

  const [uiState, setUiState] = useState<
    'default' | 'create' | 'edit' | 'loading'
  >('default')

  return (
    <ReferralPayoutAssetProvider>
      <CreateReferralFormProvider>
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
          create={() => (
            <StepTransition
              from={({ onFinish }) => (
                <CreateReferralForm onFinish={onFinish} />
              )}
              to={({ onBack }) => <CreateReferralVerify onBack={onBack} />}
            />
          )}
          edit={() => <EditReferralForm />}
          loading={() => (
            <CenterAbsolutely>
              <Spinner size="3em" />
            </CenterAbsolutely>
          )}
        />
      </CreateReferralFormProvider>
    </ReferralPayoutAssetProvider>
  )
}
