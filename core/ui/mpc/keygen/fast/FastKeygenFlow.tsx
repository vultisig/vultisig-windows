import { KeygenOperation } from '@core/mpc/keygen/KeygenOperation'
import { WaitForServerStep } from '@core/ui/mpc/fast/WaitForServerStep'
import { CreateFastKeygenServerActionProvider } from '@core/ui/mpc/keygen/create/fast/CreateFastKeygenServerActionProvider'
import { FastKeygenServerActionStep } from '@core/ui/mpc/keygen/fast/FastKeygenServerActionStep'
import { KeygenFlow } from '@core/ui/mpc/keygen/flow/KeygenFlow'
import { MigrateFastKeygenServerActionProvider } from '@core/ui/mpc/keygen/migrate/fast/MigrateFastKeygenServerActionProvider'
import { PluginReshareFastKeygenServerActionProvider } from '@core/ui/mpc/keygen/reshare/PluginReshareFastKeygenServerActionProvider'
import { ReshareFastKeygenServerActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareFastKeygenServerActionProvider'
import { useKeygenOperation } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { OnBackProp } from '@lib/ui/props'
import { match } from '@lib/utils/match'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { ComponentType } from 'react'

export const FastKeygenFlow = ({ onBack }: OnBackProp) => {
  const keygenOperation = useKeygenOperation()

  const ServerActionProvider = matchRecordUnion<
    KeygenOperation,
    ComponentType<any>
  >(keygenOperation, {
    create: () => CreateFastKeygenServerActionProvider,
    reshare: reshareType => {
      return match(reshareType, {
        regular: () => ReshareFastKeygenServerActionProvider,
        migrate: () => MigrateFastKeygenServerActionProvider,
        plugin: () => PluginReshareFastKeygenServerActionProvider,
      })
    },
  })

  return (
    <StepTransition
      from={({ onFinish }) => {
        return (
          <ServerActionProvider>
            <FastKeygenServerActionStep onFinish={onFinish} />
          </ServerActionProvider>
        )
      }}
      to={() => (
        <ValueTransfer<string[]>
          from={({ onFinish }) => <WaitForServerStep onFinish={onFinish} />}
          to={({ value }) => (
            <MpcPeersProvider value={value}>
              <StartMpcSessionFlow
                render={() => <KeygenFlow onBack={onBack} />}
                value="keygen"
              />
            </MpcPeersProvider>
          )}
        />
      )}
    />
  )
}
