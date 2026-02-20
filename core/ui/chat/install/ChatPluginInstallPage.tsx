import { getDeveloperOptions } from '@core/extension/storage/developerOptions'
import { PluginInstallAnimationProvider } from '@core/ui/mpc/keygen/reshare/plugin/PluginInstallAnimationProvider'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { ReshareVaultKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { CoreViewState } from '@core/ui/navigation/CoreView'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { getPlugin } from '@core/ui/plugins/core/get'
import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { useViewState } from '@lib/ui/navigation/hooks/useViewState'
import { Text } from '@lib/ui/text'
import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

import { useAuth } from '../hooks/useAuth'
import { ChatPluginInstallProvider } from './ChatPluginInstallContext'
import { ChatPluginReshareFlowContent } from './ChatPluginReshareFlowContent'

type PluginInstallState = CoreViewState<'chatPluginInstall'>

export const ChatPluginInstallPage = () => {
  const [{ pluginId }] = useViewState<PluginInstallState>()
  const coreNavigate = useCoreNavigate()
  const { accessToken, needsAuth, isLoading: isAuthLoading } = useAuth()

  const developerOptionsQuery = useQuery({
    queryKey: ['developerOptions'],
    queryFn: getDeveloperOptions,
  })

  const pluginQuery = useQuery({
    queryKey: ['plugin', pluginId, developerOptionsQuery.data],
    queryFn: () =>
      getPlugin(developerOptionsQuery.data!.pluginMarketplaceBaseUrl, pluginId),
    enabled: !!developerOptionsQuery.data,
  })

  const handleFinish = useCallback(
    (success: boolean) => {
      sessionStorage.setItem(
        'chat_pending_action',
        JSON.stringify({
          action: 'install_plugin',
          success,
          error: success ? undefined : 'Installation cancelled',
        })
      )
      coreNavigate({ id: 'chat' })
    },
    [coreNavigate]
  )

  const isLoading =
    developerOptionsQuery.isLoading || pluginQuery.isLoading || isAuthLoading
  const error = developerOptionsQuery.error || pluginQuery.error

  if (isLoading) {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  if (needsAuth) {
    return (
      <Center>
        <Text color="danger">Authentication required to install plugin</Text>
      </Center>
    )
  }

  if (error || !pluginQuery.data) {
    return (
      <Center>
        <Text color="danger">
          {error instanceof Error ? error.message : 'Failed to load plugin'}
        </Text>
      </Center>
    )
  }

  return (
    <ChatPluginInstallProvider value={{ accessToken, pluginId }}>
      <ReshareVaultFlowProviders>
        <KeygenOperationProvider value={{ reshare: 'plugin' }}>
          <ReshareVaultKeygenActionProvider>
            <PluginInstallAnimationProvider>
              <ChatPluginReshareFlowContent
                plugin={pluginQuery.data}
                onFinish={handleFinish}
              />
            </PluginInstallAnimationProvider>
          </ReshareVaultKeygenActionProvider>
        </KeygenOperationProvider>
      </ReshareVaultFlowProviders>
    </ChatPluginInstallProvider>
  )
}
