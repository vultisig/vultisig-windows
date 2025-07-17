import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Match } from '@lib/ui/base/Match'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useEffect, useState } from 'react'

import {
  useFriendReferralQuery,
  useSetFriendReferralMutation,
} from '../../../storage/referrals'
import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { CreateReferralForm } from './components/CreateReferral/CreateReferralForm'
import { CreateReferralVerify } from './components/CreateReferral/CreateReferralVerify'
import { EditFriendReferralForm } from './components/EditFriendReferralForm'
import { EditReferralForm } from './components/EditReferral/EditReferralForm'
import { EditReferralVerify } from './components/EditReferral/EditReferralVerify'
import { ManageExistingReferral } from './components/ManageExistingReferral'
import { ManageReferralsForm } from './components/ManageReferralsForm'
import { CreateReferralFormProvider } from './providers/CreateReferralFormProvider'
import { EditReferralFormProvider } from './providers/EditReferralFormProvider'
import { ReferralPayoutAssetProvider } from './providers/ReferralPayoutAssetProvider'
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
  const { data: friendReferral, isLoading: isFriendReferralLoading } =
    useFriendReferralQuery()
  const { mutateAsync: setFriendReferral } = useSetFriendReferralMutation()

  const { address } = shouldBePresent(
    useCurrentVaultCoin({
      chain: chainFeeCoin.THORChain.chain,
      id: 'RUNE',
    })
  )

  const { data: validNameDetails, status } =
    useUserValidThorchainNameQuery(address)

  useEffect(() => {
    if (status === 'pending') return
    if (validNameDetails) {
      setUiState('existingReferral')
    } else {
      setUiState('default')
    }
  }, [status, validNameDetails])

  return (
    <ReferralPayoutAssetProvider>
      <CreateReferralFormProvider>
        <Match
          value={uiState}
          editFriendReferral={() => (
            <EditFriendReferralForm
              userReferralName={validNameDetails?.name}
              onFinish={() =>
                validNameDetails
                  ? setUiState('existingReferral')
                  : setUiState('default')
              }
            />
          )}
          existingReferral={() =>
            validNameDetails ? (
              <ManageExistingReferral
                onEditFriendReferral={() => setUiState('editFriendReferral')}
                onEditReferral={() => setUiState('editReferral')}
                nameDetails={shouldBePresent(validNameDetails)}
              />
            ) : (
              <CenterAbsolutely>
                <Spinner size="3em" />
              </CenterAbsolutely>
            )
          }
          default={() => (
            <ManageReferralsForm
              onSaveReferral={newFriendReferral => {
                if (isFriendReferralLoading) return

                if (friendReferral) {
                  setUiState('editFriendReferral')
                  return
                }

                if (newFriendReferral) {
                  setFriendReferral(newFriendReferral)
                }
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
            <StepTransition
              from={({ onFinish }) => (
                <EditReferralFormProvider>
                  <EditReferralForm onFinish={onFinish} />§
                </EditReferralFormProvider>
              )}
              to={({ onBack }) => <EditReferralVerify onBack={onBack} />}
            />
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
