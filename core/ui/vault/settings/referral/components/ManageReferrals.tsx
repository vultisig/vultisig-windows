import { Match } from '@lib/ui/base/Match'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useEffect, useState } from 'react'

import { useAssertCurrentVaultId } from '../../../../storage/currentVaultId'
import {
  useFriendReferralQuery,
  useSetFriendReferralMutation,
} from '../../../../storage/referrals'
import { CreateReferralFormProvider } from '../providers/CreateReferralFormProvider'
import { EditReferralFormProvider } from '../providers/EditReferralFormProvider'
import { ReferralPayoutAssetProvider } from '../providers/ReferralPayoutAssetProvider'
import { useUserValidThorchainNameQuery } from '../queries/useUserValidThorchainNameQuery'
import { CreateReferralForm } from './CreateReferral/CreateReferralForm'
import { CreateReferralVerify } from './CreateReferral/CreateReferralVerify'
import { EditFriendReferralForm } from './EditFriendReferralForm'
import { EditReferralForm } from './EditReferral/EditReferralForm'
import { EditReferralVerify } from './EditReferral/EditReferralVerify'
import { ManageExistingReferral } from './ManageExistingReferral'
import { ManageMissingReferral } from './ManageMissingReferral'
import { ManageReferralsForm } from './ManageReferralsForm'

type ManageReferralUIState =
  | 'default'
  | 'create'
  | 'editReferral'
  | 'loading'
  | 'existingReferral'
  | 'editFriendReferral'
  | 'manageMissingReferral'

export const ManageReferrals = () => {
  const [uiState, setUiState] = useState<ManageReferralUIState>('loading')

  const vaultId = useAssertCurrentVaultId()
  const { data: friendReferral, isLoading: isFriendReferralLoading } =
    useFriendReferralQuery(vaultId)

  const { mutateAsync: setFriendReferral } =
    useSetFriendReferralMutation(vaultId)

  const { data: validNameDetails, status } = useUserValidThorchainNameQuery()

  // TODO: check why when I click on 'Change Friends Referral Code..." I don't get to: EditFriendReferralForm but rather I again see ManageExistingReferral?
  useEffect(() => {
    if (status === 'pending') return

    if (uiState === 'existingReferral' && !validNameDetails) {
      setUiState('manageMissingReferral')
      return
    }

    if (uiState === 'manageMissingReferral' && !validNameDetails) {
      return
    }

    if (validNameDetails) {
      setUiState('existingReferral')
      return
    }

    setUiState('default')
  }, [status, uiState, validNameDetails])

  return (
    <ReferralPayoutAssetProvider>
      <Match
        manageMissingReferral={() => (
          <ManageMissingReferral
            onCreateReferral={() => setUiState('create')}
            onEditFriendReferral={() => setUiState('editFriendReferral')}
          />
        )}
        value={uiState}
        editFriendReferral={() => (
          <EditFriendReferralForm
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
            onEditFriendReferral={() => setUiState('editFriendReferral')}
            onSaveReferral={(value = '') => {
              const newFriendReferral = value.trim()

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
          <CreateReferralFormProvider>
            <StepTransition
              from={({ onFinish }) => (
                <CreateReferralForm onFinish={onFinish} />
              )}
              to={({ onBack }) => <CreateReferralVerify onBack={onBack} />}
            />
          </CreateReferralFormProvider>
        )}
        editReferral={() => (
          <EditReferralFormProvider>
            <StepTransition
              from={({ onFinish }) => (
                <EditReferralForm
                  nameDetails={shouldBePresent(validNameDetails)}
                  onFinish={onFinish}
                />
              )}
              to={({ onBack }) => <EditReferralVerify onBack={onBack} />}
            />
          </EditReferralFormProvider>
        )}
        loading={() => (
          <CenterAbsolutely>
            <Spinner size="3em" />
          </CenterAbsolutely>
        )}
      />
    </ReferralPayoutAssetProvider>
  )
}
