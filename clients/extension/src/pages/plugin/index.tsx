import { ReshareSecureVaultFlow } from '@core/ui/mpc/keygen/reshare/ReshareSecureVaultFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { ReshareVaultKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { EmailProvider } from '@core/ui/state/email'
import { PasswordProvider } from '@core/ui/state/password'

import { initializeMessenger } from '../../messengers/initializeMessenger'

const backgroundMessenger = initializeMessenger({ connect: 'background' })

export const PluginPage = () => {
  const onJoinUrl = async (joinUrl: string) => {
    await backgroundMessenger.send('plugin:reshare', {
      joinUrl,
    })
  }
  return (
    <ReshareVaultFlowProviders>
      <PasswordProvider initialValue="">
        <EmailProvider initialValue="">
          <CurrentKeygenTypeProvider value="reshare">
            <ReshareVaultKeygenActionProvider>
              <ReshareSecureVaultFlow
                pluginParams={{ isAddPlugin: true, onJoinUrl }}
              />
            </ReshareVaultKeygenActionProvider>
          </CurrentKeygenTypeProvider>
        </EmailProvider>
      </PasswordProvider>
    </ReshareVaultFlowProviders>
  )
}
