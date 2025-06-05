import { isServer } from '@core/mpc/devices/localPartyId'
import { KeygenOperation } from '@core/mpc/keygen/KeygenOperation'
import { useKeygenOperation } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { OnBackProp, OnFinishProp, ValueProp } from '@lib/ui/props'
import { match } from '@lib/utils/match'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { ComponentType, useCallback } from 'react'

import { pluginPeersConfig } from '../../fast/config'
import { WaitForServerStep } from '../../fast/WaitForServerStep'
import { StartMpcSessionFlow } from '../../session/StartMpcSessionFlow'
import { MpcPeersProvider } from '../../state/mpcPeers'
import { CreateFastKeygenServerActionProvider } from '../create/fast/CreateFastKeygenServerActionProvider'
import { KeygenFlow } from '../flow/KeygenFlow'
import { MigrateFastKeygenServerActionProvider } from '../migrate/fast/MigrateFastKeygenServerActionProvider'
import { PluginReshareFastKeygenServerActionProvider } from '../reshare/PluginReshareFastKeygenServerActionProvider'
import { ReshareFastKeygenServerActionProvider } from '../reshare/ReshareFastKeygenServerActionProvider'
import { FastKeygenServerActionStep } from './FastKeygenServerActionStep'

export const FastKeygenFlow = ({ onBack }: OnBackProp) => {
  const keygenOperation = useKeygenOperation()

  const handlePeersChange = useCallback(
    ({
      value: peers,
      onFinish,
    }: ValueProp<string[]> & OnFinishProp<string[]>) => {
      const isPluginReshare =
        'reshare' in keygenOperation && keygenOperation.reshare === 'plugin'

      const shouldFinish =
        !isPluginReshare ||
        peers.length >= pluginPeersConfig.minimumJoinedParties

      if (shouldFinish) {
        onFinish(peers.filter(device => !isServer(device)))
      }
    },
    [keygenOperation]
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
                render={() => <KeygenFlow onBack={onBack} />}
              />
            </MpcPeersProvider>
          )}
        />
      )}
    />
  )
}
