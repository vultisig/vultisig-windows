import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { RenderProp, ValueProp } from '@lib/ui/props'
import { ReactNode } from 'react'

import { MpcSignersProvider } from '../devices/state/signers'
import { MpcSession } from './MpcSession'
import { StartMpcSessionStep } from './StartMpcSessionStep'

export const StartMpcSessionFlow = ({
  render,
  onError,
  renderPending,
  value,
  securityType,
}: RenderProp &
  ValueProp<MpcSession> & {
    onError?: () => void
    renderPending?: () => ReactNode
    securityType?: VaultSecurityType
  }) => {
  return (
    <ValueTransfer<string[]>
      from={({ onFinish }) => (
        <StartMpcSessionStep
          onError={onError}
          onFinish={onFinish}
          renderPending={renderPending}
          value={value}
          securityType={securityType}
        />
      )}
      to={({ value }) => (
        <MpcSignersProvider value={value}>{render()}</MpcSignersProvider>
      )}
    />
  )
}
