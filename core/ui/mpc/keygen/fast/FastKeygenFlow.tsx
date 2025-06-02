import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { useCurrentKeygenType } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { OnBackProp } from '@lib/ui/props'
import { ComponentType } from 'react'

import { WaitForServerStep } from '../../fast/WaitForServerStep'
import { StartMpcSessionFlow } from '../../session/StartMpcSessionFlow'
import { MpcPeersProvider } from '../../state/mpcPeers'
import { CreateFastKeygenServerActionProvider } from '../create/fast/CreateFastKeygenServerActionProvider'
import { KeygenFlow } from '../flow/KeygenFlow'
import { MigrateFastKeygenServerActionProvider } from '../migrate/fast/MigrateFastKeygenServerActionProvider'
import { ReshareFastKeygenServerActionProvider } from '../reshare/ReshareFastKeygenServerActionProvider'
import { FastKeygenServerActionStep } from './FastKeygenServerActionStep'

const serverActionProviders: Record<KeygenType, ComponentType<any>> = {
  create: CreateFastKeygenServerActionProvider,
  reshare: ReshareFastKeygenServerActionProvider,
  migrate: MigrateFastKeygenServerActionProvider,
}

export const FastKeygenFlow = ({
  onBack,
  isPluginReshare,
}: OnBackProp & Partial<{ isPluginReshare: boolean }>) => {
  const keygenType = useCurrentKeygenType()

  const ServerActionProvider = serverActionProviders[keygenType]

  return (
    <StepTransition
      from={({ onFinish }) => {
        const props = keygenType === 'reshare' ? { isPluginReshare } : {}
        return (
          <ServerActionProvider {...props}>
            <FastKeygenServerActionStep onFinish={onFinish} onBack={onBack} />
          </ServerActionProvider>
        )
      }}
      to={() => (
        <ValueTransfer<string[]>
          from={({ onFinish }) => (
            <WaitForServerStep
              onBack={onBack}
              onFinish={onFinish}
              value={isPluginReshare}
            />
          )}
          to={({ value }) => (
            <MpcPeersProvider value={value}>
              <StartMpcSessionFlow
                value="keygen"
                isPluginReshare={isPluginReshare}
                render={() => <KeygenFlow onBack={onBack} />}
              />
            </MpcPeersProvider>
          )}
        />
      )}
    />
  )
}
