import { Button } from '@clients/extension/src/components/button'
import { useClearVaultSessionsMutation } from '@clients/extension/src/sessions/mutations/useClearVaultSessionsMutation'
import { useRemoveVaultSessionMutation } from '@clients/extension/src/sessions/mutations/useRemoveVaultSessionMutation'
import { useCurrentVaultAppSessionsQuery } from '@clients/extension/src/sessions/state/useAppSessions'
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
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { initializeMessenger } from '../../messengers/initializeMessenger'
import { EventMethod } from '../../utils/constants'

const StyledEmptyState = styled(VStack)`
  background-color: ${getColor('backgroundsSecondary')};
  border-radius: 12px;
  padding: 64px;
`
const StyledText = styled(Text)`
  text-align: center;
`

const inpageMessenger = initializeMessenger({ connect: 'inpage' })

export const ConnectedDappsPage = () => {
  const { t } = useTranslation()
  const { data: sessions = {} } = useCurrentVaultAppSessionsQuery()
  const currentVaultId = useCurrentVaultId()
  const { mutateAsync: removeSession } = useRemoveVaultSessionMutation()
  const { mutateAsync: clearSessions } = useClearVaultSessionsMutation()
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const isDisconnectingRef = useRef(false)
  const handleDisconnect = async (host: string, url: string) => {
    if (isDisconnectingRef.current) return
    isDisconnectingRef.current = true
    setIsDisconnecting(true)
    try {
      await removeSession({ vaultId: shouldBePresent(currentVaultId), host })
      await inpageMessenger.send(`${EventMethod.DISCONNECT}:${url}`, {})
    } catch (error) {
      console.error(`Failed to disconnect session for ${host}:`, error)
    } finally {
      isDisconnectingRef.current = false
      setIsDisconnecting(false)
    }
  }

  const handleDisconnectAll = async () => {
    if (isDisconnectingRef.current) return
    isDisconnectingRef.current = true
    setIsDisconnecting(true)
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
    } finally {
      isDisconnectingRef.current = false
      setIsDisconnecting(false)
    }
  }
  const sessionsArray = Object.entries(sessions)
  const navigateBack = useNavigateBack()

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
                      disabled={isDisconnecting}
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
            <Button
              onClick={handleDisconnectAll}
              type="primary"
              block
              rounded
              disabled={isDisconnecting}
            >
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
          <StyledEmptyState
            alignItems="center"
            gap={24}
            justifyContent="center"
          >
            <DAppsIcon fontSize={36} />
            <VStack
              alignItems="center"
              gap={16}
              justifyContent="center"
              fullWidth
            >
              <StyledText color="contrast" size={17} weight={500}>
                {t('no_connected_dapps')}
              </StyledText>
              <StyledText color="light" size={14} weight={500}>
                {t('no_connected_dapps_desc')}
              </StyledText>
            </VStack>
          </StyledEmptyState>
        </PageContent>
      )}
    </VStack>
  )
}
