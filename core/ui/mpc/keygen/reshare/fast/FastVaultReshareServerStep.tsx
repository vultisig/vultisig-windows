import { SetupVaultServerStep } from '@core/ui/mpc/keygen/create/fast/SetupVaultServerStep'
import { FastMigrateServerStep } from '@core/ui/mpc/keygen/reshare/fast/FastMigrateServerStep'
import { FastReshareServerStep } from '@core/ui/mpc/keygen/reshare/fast/FastReshareServerStep'
import { useCurrentKeygenType } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { Match } from '@lib/ui/base/Match'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'

export const FastVaultReshareServerStep = ({
  onFinish,
  onBack,
}: OnFinishProp & Partial<OnBackProp>) => {
  const keygenType = useCurrentKeygenType()

  return (
    <Match
      value={keygenType}
      reshare={() => <FastReshareServerStep onFinish={onFinish} />}
      migrate={() => <FastMigrateServerStep onFinish={onFinish} />}
      create={() => (
        <SetupVaultServerStep onBack={onBack} onFinish={onFinish} />
      )}
    />
  )
}
