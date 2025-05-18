import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { useCurrentKeygenType } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { ComponentType } from 'react'

import { CreateFastKeygenServerActionProvider } from '../create/fast/CreateFastKeygenServerActionProvider'
import { MigrateFastKeygenServerActionProvider } from '../migrate/fast/MigrateFastKeygenServerActionProvider'
import { ReshareFastKeygenServerActionProvider } from '../reshare/ReshareFastKeygenServerActionProvider'
import { FastKeygenServerActionStep } from './FastKeygenServerActionStep'

const serverActionProviders: Record<KeygenType, ComponentType<any>> = {
  create: CreateFastKeygenServerActionProvider,
  reshare: ReshareFastKeygenServerActionProvider,
  migrate: MigrateFastKeygenServerActionProvider,
}

export const FastKeygenServerStep = ({
  onFinish,
  onBack,
}: OnFinishProp & OnBackProp) => {
  const keygenType = useCurrentKeygenType()

  const ServerActionProvider = serverActionProviders[keygenType]

  return (
    <StepTransition
      from={() => (
        <ServerActionProvider>
          <FastKeygenServerActionStep onFinish={onFinish} onBack={onBack} />
        </ServerActionProvider>
      )}
      to={() => null}
    />
  )
}
