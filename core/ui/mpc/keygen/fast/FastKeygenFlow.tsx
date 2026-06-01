import { WaitForServerStep } from '@core/ui/mpc/fast/WaitForServerStep'
import { CreateFastKeygenServerActionProvider } from '@core/ui/mpc/keygen/create/fast/CreateFastKeygenServerActionProvider'
import { FastKeygenServerActionStep } from '@core/ui/mpc/keygen/fast/FastKeygenServerActionStep'
import { KeygenFlow } from '@core/ui/mpc/keygen/flow/KeygenFlow'
import { MigrateFastKeygenServerActionProvider } from '@core/ui/mpc/keygen/migrate/fast/MigrateFastKeygenServerActionProvider'
import { PluginReshareFastKeygenServerActionProvider } from '@core/ui/mpc/keygen/reshare/PluginReshareFastKeygenServerActionProvider'
import { ReshareFastKeygenServerActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareFastKeygenServerActionProvider'
import { SingleKeygenFastServerActionProvider } from '@core/ui/mpc/keygen/singleKeygen/fast/SingleKeygenFastServerActionProvider'
import { useKeygenOperation } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { OnBackProp } from '@lib/ui/props'
import { KeygenOperation } from '@vultisig/core-mpc/keygen/KeygenOperation'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { match } from '@vultisig/lib-utils/match'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { ComponentType } from 'react'

import { KeyImportFastKeygenServerActionProvider } from '../keyimport/fast/KeyImportFastKeygenServerActionProvider'

type FastKeygenFlowProps = OnBackProp & {
  onKeygenError?: (error: Error) => void | Promise<void>
  password?: string
  onChangeEmailAndRestart?: () => void
  onVaultSaveError?: (error: Error) => void | Promise<void>
  onVaultSaved?: (vault: Vault) => void | Promise<void>
}

export const FastKeygenFlow = ({
  onBack,
  onKeygenError,
  password,
  onChangeEmailAndRestart,
  onVaultSaveError,
  onVaultSaved,
}: FastKeygenFlowProps) => {
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
    keyimport: () => KeyImportFastKeygenServerActionProvider,
    singleKeygen: () => SingleKeygenFastServerActionProvider,
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
                render={() => (
                  <KeygenFlow
                    onBack={onBack}
                    onKeygenError={onKeygenError}
                    password={password}
                    onChangeEmailAndRestart={onChangeEmailAndRestart}
                    onVaultSaveError={onVaultSaveError}
                    onVaultSaved={onVaultSaved}
                  />
                )}
                value="keygen"
              />
            </MpcPeersProvider>
          )}
        />
      )}
    />
  )
}
