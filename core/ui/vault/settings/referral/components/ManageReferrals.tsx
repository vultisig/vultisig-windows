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
} from '../../../../storage/referrals'
import { useCurrentVaultCoin } from '../../../state/currentVaultCoins'
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
import { ManageReferralsForm } from './ManageReferralsForm'

type ManageReferralUIState =
  | 'default'
  | 'create'
  | 'editReferral'
  | 'loading'
  | 'existingReferral'
  | 'editFriendReferral'

export const ManageReferrals = () => {
  const [uiState, setUiState] = useState<ManageReferralUIState>('loading')

  const { data: friendReferral, isLoading: isFriendReferralLoading } =
    useFriendReferralQuery()
  const { mutateAsync: setFriendReferral } = useSetFriendReferralMutation()

  const { address } = useCurrentVaultCoin({
    chain: chainFeeCoin.THORChain.chain,
    id: 'RUNE',
  })

  const { data: validNameDetails, status } =
    useUserValidThorchainNameQuery(address)

  useEffect(() => {
    if (status === 'pending') return

    if (validNameDetails) {
      setUiState('existingReferral')
      return
    }

    setUiState('default')
  }, [status, validNameDetails])

  return (
    <ReferralPayoutAssetProvider>
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
