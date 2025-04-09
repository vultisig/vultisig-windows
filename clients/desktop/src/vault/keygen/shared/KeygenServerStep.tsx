import { useCurrentKeygenType } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { Match } from '@lib/ui/base/Match'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'

import { FastMigrateServerStep } from '../../migrate/fast/FastMigrateServerStep'
import { FastReshareServerStep } from '../../reshare/fast/FastReshareServerStep'
import { SetupVaultServerStep } from '../../setup/fast/SetupVaultServerStep'

export const KeygenServerStep = ({
  onFinish,
  onBack,
}: OnFinishProp & Partial<OnBackProp>) => {
  const keygenType = useCurrentKeygenType()

  return (
    <Match
      value={keygenType}
      reshare={() => <FastReshareServerStep onForward={onFinish} />}
      migrate={() => <FastMigrateServerStep onForward={onFinish} />}
      create={() => (
        <SetupVaultServerStep onBack={onBack} onForward={onFinish} />
      )}
    />
  )
}
