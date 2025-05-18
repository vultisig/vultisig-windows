import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { useCurrentKeygenType } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { ChildrenProp, OnBackProp } from '@lib/ui/props'
import { ComponentType } from 'react'

import { WaitForServerStep } from '../../fast/WaitForServerStep'
import { MpcPeersProvider } from '../../state/mpcPeers'
import { CreateFastKeygenServerActionProvider } from '../create/fast/CreateFastKeygenServerActionProvider'
import { MigrateFastKeygenServerActionProvider } from '../migrate/fast/MigrateFastKeygenServerActionProvider'
import { ReshareFastKeygenServerActionProvider } from '../reshare/ReshareFastKeygenServerActionProvider'
import { FastKeygenServerActionStep } from './FastKeygenServerActionStep'

const serverActionProviders: Record<KeygenType, ComponentType<any>> = {
  create: CreateFastKeygenServerActionProvider,
  reshare: ReshareFastKeygenServerActionProvider,
  migrate: MigrateFastKeygenServerActionProvider,
}

export const FastKeygenMpcPeersProvider = ({
  onBack,
  children,
}: OnBackProp & ChildrenProp) => {
  const keygenType = useCurrentKeygenType()

  const ServerActionProvider = serverActionProviders[keygenType]

  return (
    <StepTransition
      from={({ onFinish }) => (
        <ServerActionProvider>
          <FastKeygenServerActionStep onFinish={onFinish} onBack={onBack} />
        </ServerActionProvider>
      )}
      to={() => (
        <ValueTransfer<string[]>
          from={({ onFinish }) => (
            <WaitForServerStep onBack={onBack} onFinish={onFinish} />
          )}
          to={({ value }) => (
            <MpcPeersProvider value={value}>{children}</MpcPeersProvider>
          )}
        />
      )}
    />
  )
}
