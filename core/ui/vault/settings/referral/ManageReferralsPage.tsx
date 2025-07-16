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
import { CreateReferralFormProvider } from './providers/CreateReferralFormProvider'
import { EditReferralFormProvider } from './providers/EditReferralFormProvider'
import { ReferralPayoutAssetProvider } from './providers/ReferralPayoutAssetProvider'
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
    if (validNameDetails && referralDashboardData) {
      setUiState('existingReferral')
    } else if (validNameDetails) {
      setUiState('editReferral')
    } else {
      setUiState('default')
    }
  }, [status, validNameDetails, referralDashboardData])

  return (
    <ReferralPayoutAssetProvider>
      <CreateReferralFormProvider>
        <Match
          value={uiState}
          editFriendReferral={() => <EditFriendReferral />}
          existingReferral={() =>
            referralDashboardData ? (
              <ManageExistingReferral
                onEditFriendReferral={() => setUiState('editFriendReferral')}
                onEditReferral={() => setUiState('editReferral')}
                referralDashboardData={shouldBePresent(referralDashboardData)}
              />
            ) : (
              <CenterAbsolutely>
                <Spinner size="3em" />
              </CenterAbsolutely>
            )
          }
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
          editReferral={() => (
            <EditReferralFormProvider>
              <EditReferralForm onFinish={() => {}} />§
            </EditReferralFormProvider>
          )}
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
