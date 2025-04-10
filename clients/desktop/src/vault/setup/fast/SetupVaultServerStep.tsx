import { OnBackProp, OnForwardProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { FC } from 'react'

import { WaitForServerStates } from '../../server/components/WaitForServerStates'
import { useVaultCreationPreparation } from './hooks/useVaultCreationPreparation'

export const SetupVaultServerStep: FC<OnForwardProp & Partial<OnBackProp>> = ({
  onForward,
  onBack,
}) => {
  const state = useVaultCreationPreparation()

  return (
    <MatchQuery
      value={state}
      pending={() => <WaitForServerStates state="pending" />}
      success={() => (
        <WaitForServerStates state="success" onAnimationEnd={onForward} />
      )}
      error={() => (
        <WaitForServerStates state="error" onAnimationEnd={onBack} />
      )}
    />
  )
}
