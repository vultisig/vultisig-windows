import { Match } from '@lib/ui/base/Match'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { ValueProp } from '@lib/ui/props'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useState } from 'react'

import { useAssertCurrentVaultId } from '../../../../storage/currentVaultId'
import {
  useFriendReferralQuery,
  useSetFriendReferralMutation,
} from '../../../../storage/referrals'
import { CreateReferralFormProvider } from '../providers/CreateReferralFormProvider'
import { EditReferralFormProvider } from '../providers/EditReferralFormProvider'
import { ReferralPayoutAssetProvider } from '../providers/ReferralPayoutAssetProvider'
import { ValidThorchainNameDetails } from '../services/getUserValidThorchainName'
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
  | 'createReferral'
  | 'editReferral'
  | 'referralManagement'
  | 'editFriendReferral'

export const ManageReferrals = ({
  value: validNameDetails = null,
}: Partial<ValueProp<ValidThorchainNameDetails | null>>) => {
  const [view, setView] = useState<ManageReferralUIState>(
    validNameDetails ? 'referralManagement' : 'default'
  )

  const vaultId = useAssertCurrentVaultId()

  const { data: friendReferral, isLoading: isFriendReferralLoading } =
    useFriendReferralQuery(vaultId)

  const { mutateAsync: setFriendReferral } =
    useSetFriendReferralMutation(vaultId)

  return (
    <ReferralPayoutAssetProvider>
      <Match
        value={view}
        editFriendReferral={() => (
          <EditFriendReferralForm
            onFinish={() =>
              validNameDetails
                ? setView('referralManagement')
                : setView('default')
            }
          />
        )}
        referralManagement={() =>
          validNameDetails ? (
            <ManageExistingReferral
              onEditFriendReferral={() => setView('editFriendReferral')}
              onEditReferral={() => setView('editReferral')}
              nameDetails={shouldBePresent(validNameDetails)}
            />
          ) : (
            <ManageMissingReferral
              onCreateReferral={() => setView('createReferral')}
              onEditFriendReferral={() => setView('editFriendReferral')}
            />
          )
        }
        default={() => (
          <ManageReferralsForm
            onEditFriendReferral={() => setView('editFriendReferral')}
            onSaveReferral={(value = '') => {
              const newFriendReferral = value.trim()

              if (isFriendReferralLoading) return

              if (friendReferral) {
                setView('editFriendReferral')
                return
              }

              if (newFriendReferral) {
                setFriendReferral(newFriendReferral)
              }
            }}
            onCreateReferral={() => setView('createReferral')}
          />
        )}
        createReferral={() => (
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
      />
    </ReferralPayoutAssetProvider>
  )
}
