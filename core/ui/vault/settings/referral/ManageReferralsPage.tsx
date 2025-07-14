import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Match } from '@lib/ui/base/Match'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useEffect, useState } from 'react'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { CreateReferralForm } from './components/CreateReferralForm'
import { CreateReferralVerify } from './components/CreateReferralVerify'
import { EditFriendReferral } from './components/EditFriendReferral'
import { EditReferralForm } from './components/EditReferralForm'
import { ManageExistingReferral } from './components/ManageExistingReferral'
import { ManageReferralsForm } from './components/ManageReferralsForm'
import { CreateReferralFormProvider } from './provders/CreateReferralFormProvider'
import { ReferralPayoutAssetProvider } from './provders/ReferralPayoutAssetProvider'
import { useReferralDashboard } from './queries/useReferralDashboard'
import { useUserValidThorchainNameQuery } from './queries/useUserValidThorchainNameQuery'

type ManageReferralUIState =
  | 'default'
  | 'create'
  | 'editReferral'
  | 'loading'
  | 'existingReferral'
  | 'editFriendReferral'

export const ManageReferralsPage = () => {
  const [uiState, setUiState] = useState<ManageReferralUIState>('loading')

  const navigate = useCoreNavigate()
  const { address } = shouldBePresent(
    useCurrentVaultCoin({
      chain: chainFeeCoin.THORChain.chain,
      id: 'RUNE',
    })
  )

  const { data: validNameDetails, status } =
    useUserValidThorchainNameQuery(address)

  const { data: referralDashboardData } = useReferralDashboard(address)

  useEffect(() => {
    if (status === 'pending') return
    if (validNameDetails) {
      setUiState('editReferral')
    } else {
      setUiState('default')
    }
  }, [status, validNameDetails])

  return (
    <ReferralPayoutAssetProvider>
      <CreateReferralFormProvider>
        <Match
          value={uiState}
          editFriendReferral={() => <EditFriendReferral />}
          existingReferral={() => (
            <ManageExistingReferral
              onEditFriendReferral={() => setUiState('editFriendReferral')}
              onEditReferral={() => setUiState('editReferral')}
              referralDashboardData={referralDashboardData}
            />
          )}
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
          editReferral={() => <EditReferralForm />}
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
