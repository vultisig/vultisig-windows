import { FastVaultReshareFlow } from '@core/ui/mpc/keygen/reshare/fast/FastVaultReshareFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { EmailProvider } from '@core/ui/state/email'
import { PasswordProvider } from '@core/ui/state/password'

import { initializeMessenger } from '../../messengers/initializeMessenger'
import { JoinKeygenUrlSender } from './JoinKeygenUrlSender'
const backgroundMessenger = initializeMessenger({ connect: 'background' })

export const PluginPage = () => {
  const onJoinUrl = async (joinUrl: string) => {
    try {
      await backgroundMessenger.send('plugin:reshare', {
        joinUrl,
      })
    } catch (error) {
      console.error('Failed to send plugin reshare message:', error)
    }
  }

  return (
    <ReshareVaultFlowProviders>
      <EmailProvider initialValue="">
        <PasswordProvider initialValue="">
          <CurrentKeygenTypeProvider value="plugin">
            <JoinKeygenUrlSender onJoinUrl={onJoinUrl} />
            <FastVaultReshareFlow />
          </CurrentKeygenTypeProvider>
        </PasswordProvider>
      </EmailProvider>
    </ReshareVaultFlowProviders>
  )
}
