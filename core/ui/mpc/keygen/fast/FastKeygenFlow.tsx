import { KeygenOperation } from '@core/mpc/keygen/KeygenOperation'
import { pluginPeersConfig } from '@core/ui/mpc/fast/config'
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
import { OnBackProp, OnFinishProp, ValueProp } from '@lib/ui/props'
import { match } from '@lib/utils/match'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { ComponentType, useCallback, useMemo } from 'react'

export const FastKeygenFlow = ({ onBack }: OnBackProp) => {
  const keygenOperation = useKeygenOperation()
  const isPluginReshare = useMemo(() => {
    return 'reshare' in keygenOperation && keygenOperation.reshare === 'plugin'
  }, [keygenOperation])

  const handlePeersChange = useCallback(
    ({
      value: peers,
      onFinish,
    }: ValueProp<string[]> & OnFinishProp<string[]>) => {
      const shouldFinish =
        !isPluginReshare ||
        peers.length >= pluginPeersConfig.minimumJoinedParties

      if (shouldFinish) {
        onFinish(peers)
      }
    },
    [isPluginReshare]
  )

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
            <FastKeygenServerActionStep onFinish={onFinish} onBack={onBack} />
          </ServerActionProvider>
        )
      }}
      to={() => (
        <ValueTransfer<string[]>
          from={({ onFinish }) => {
            return (
              <WaitForServerStep
                onBack={onBack}
                onPeersChange={value => handlePeersChange({ value, onFinish })}
              />
            )
          }}
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
