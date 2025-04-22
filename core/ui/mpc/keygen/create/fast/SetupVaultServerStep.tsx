import { WaitForServerStates } from '@core/ui/mpc/keygen/create/fast/server/components/WaitForServerStates'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { FC } from 'react'

import { useVaultCreationPreparation } from './hooks/useVaultCreationPreparation'

export const SetupVaultServerStep: FC<OnFinishProp & Partial<OnBackProp>> = ({
  onFinish,
  onBack,
}) => {
  const state = useVaultCreationPreparation()

  return (
    <MatchQuery
      value={state}
      pending={() => <WaitForServerStates state="pending" />}
      success={() => (
        <WaitForServerStates state="success" onAnimationEnd={onFinish} />
      )}
      error={() => (
        <WaitForServerStates state="error" onAnimationEnd={onBack} />
      )}
    />
  )
}
