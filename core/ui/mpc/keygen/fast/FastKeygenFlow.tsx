import { KeygenOperation } from '@core/mpc/keygen/KeygenOperation'
import { useCurrentKeygenOperationType } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { OnBackProp } from '@lib/ui/props'
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion'
import { ComponentType } from 'react'

import { WaitForServerStep } from '../../fast/WaitForServerStep'
import { StartMpcSessionFlow } from '../../session/StartMpcSessionFlow'
import { MpcPeersProvider } from '../../state/mpcPeers'
import { CreateFastKeygenServerActionProvider } from '../create/fast/CreateFastKeygenServerActionProvider'
import { KeygenFlow } from '../flow/KeygenFlow'
import { MigrateFastKeygenServerActionProvider } from '../migrate/fast/MigrateFastKeygenServerActionProvider'
import { PluginReshareFastKeygenServerActionProvider } from '../reshare/PluginReshareFastKeygenServerActionProvider'
import { ReshareFastKeygenServerActionProvider } from '../reshare/ReshareFastKeygenServerActionProvider'
import { FastKeygenServerActionStep } from './FastKeygenServerActionStep'

export const FastKeygenFlow = ({
  onBack,
}: OnBackProp & Partial<{ isPluginReshare: boolean }>) => {
  const operationType = useCurrentKeygenOperationType()

  const ServerActionProvider = matchDiscriminatedUnion<
    KeygenOperation,
    ComponentType<any>
  >(operationType, 'operation', 'type', {
    create: () => CreateFastKeygenServerActionProvider,
    migrate: () => MigrateFastKeygenServerActionProvider,
    reshare: () => ReshareFastKeygenServerActionProvider,
    regular: () => ReshareFastKeygenServerActionProvider,
    plugin: () => PluginReshareFastKeygenServerActionProvider,
  })

  const isPluginReshare =
    operationType.operation === 'reshare' && operationType.type === 'plugin'

  return (
    <StepTransition
      from={({ onFinish }) => {
        return (
          <ServerActionProvider>
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
