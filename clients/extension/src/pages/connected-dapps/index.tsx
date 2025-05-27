import { Button } from '@clients/extension/src/components/button'
import { initializeMessenger } from '@clients/extension/src/messengers/initializeMessenger'
import { useClearVaultSessionsMutation } from '@clients/extension/src/sessions/mutations/useClearVaultSessionsMutation'
import { useRemoveVaultSessionMutation } from '@clients/extension/src/sessions/mutations/useRemoveVaultSessionMutation'
import { useCurrentVaultAppSessionsQuery } from '@clients/extension/src/sessions/state/useAppSessions'
import { EventMethod } from '@clients/extension/src/utils/constants'
import { useCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { DAppsIcon } from '@lib/ui/icons/DAppsIcon'
import { LinkTwoOffIcon } from '@lib/ui/icons/LinkTwoOffIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useTranslation } from 'react-i18next'

const inpageMessenger = initializeMessenger({ connect: 'inpage' })

export const ConnectedDappsPage = () => {
  const { t } = useTranslation()
  const { data: sessions = {} } = useCurrentVaultAppSessionsQuery()
  const { mutateAsync: removeSession } = useRemoveVaultSessionMutation()
  const { mutateAsync: clearSessions } = useClearVaultSessionsMutation()
  const sessionsArray = Object.entries(sessions)
  const currentVaultId = useCurrentVaultId()
  const navigateBack = useNavigateBack()

  const handleDisconnect = async (host: string, url: string) => {
    try {
      await removeSession({ vaultId: shouldBePresent(currentVaultId), host })
      await inpageMessenger.send(`${EventMethod.DISCONNECT}:${url}`, {})
    } catch (error) {
      console.error(`Failed to disconnect session for ${host}:`, error)
    }
  }

  const handleDisconnectAll = async () => {
    try {
      await clearSessions({ vaultId: shouldBePresent(currentVaultId) })
      const uniqueUrls = new Set(
        Object.values(sessions).map(session => session.url)
      )
      await Promise.allSettled(
        [...uniqueUrls].map(url =>
          inpageMessenger.send(`${EventMethod.DISCONNECT}:${url}`, {})
        )
      )
    } catch (error) {
      console.error('Failed to disconnect all sessions:', error)
    }
  }

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          <Button
            icon={<ChevronLeftIcon fontSize={20} />}
            onClick={navigateBack}
            size="sm"
            fitContent
          />
        }
        title={
          <Text color="contrast" size={18} weight={500}>
            {t('connected_dapps')}
          </Text>
        }
        hasBorder
      />
      {sessionsArray.length ? (
        <>
          <PageContent gap={12} flexGrow scrollable>
            <Text color="light" size={12} weight={500}>
              {t('overview')}
            </Text>
            <List>
              {sessionsArray.map(([host, session]) => (
                <ListItem
                  key={host}
                  extra={
                    <Button
                      icon={<LinkTwoOffIcon fontSize={20} />}
                      onClick={() => handleDisconnect(host, session.url)}
                      size="md"
                      status="error"
                      fitContent
                    />
                  }
                  title={
                    <Text color="contrast" size={14} weight={500}>
                      {host}
                    </Text>
                  }
                />
              ))}
            </List>
          </PageContent>
          <PageFooter alignItems="center">
            <Button onClick={handleDisconnectAll} type="primary" block rounded>
              {t('disconnect_all')}
            </Button>
          </PageFooter>
        </>
      ) : (
        <PageContent
          alignItems="center"
          gap={12}
          justifyContent="center"
          flexGrow
          scrollable
        >
          <Panel>
            <VStack alignItems="center" gap={24} justifyContent="center">
              <DAppsIcon fontSize={36} />
              <VStack
                alignItems="center"
                gap={16}
                justifyContent="center"
                fullWidth
              >
                <Text size={17} weight={500} centerHorizontally>
                  {t('no_connected_dapps')}
                </Text>
                <Text color="light" size={14} weight={500} centerHorizontally>
                  {t('no_connected_dapps_desc')}
                </Text>
              </VStack>
            </VStack>
          </Panel>
        </PageContent>
      )}
    </VStack>
  )
}
