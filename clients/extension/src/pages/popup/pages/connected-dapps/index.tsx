import { Button } from '@clients/extension/src/components/button'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useTranslation } from 'react-i18next'

import { useClearVaultSessionsMutation } from '../../../../sessions/mutations/useClearVaultSessionsMutation'
import { useRemoveVaultSessionMutation } from '../../../../sessions/mutations/useRemoveVaultSessionMutation'
import { useCurrentVaultAppSessions } from '../../../../sessions/state/useAppSessions'

export const ConnectedDappsPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const sessions = useCurrentVaultAppSessions()
  const currentVaultId = useCurrentVaultId()
  const { mutateAsync: removeSession } = useRemoveVaultSessionMutation()
  const { mutateAsync: clearSessions } = useClearVaultSessionsMutation()
  const handleDisconnect = async (host: string) => {
    await removeSession({ vaultId: shouldBePresent(currentVaultId), host })
  }

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          <Button onClick={() => navigate('vault')} ghost>
            <ChevronLeftIcon fontSize={20} />
          </Button>
        }
        title={
          <Text color="contrast" size={18} weight={500}>
            {t('connected_dapps')}
          </Text>
        }
        hasBorder
      />
      <PageContent gap={12} flexGrow scrollable>
        <Text color="light" size={12} weight={500}>
          {t('overview')}
        </Text>
        <List>
          {Object.entries(sessions).map(([host]) => (
            <ListItem
              key={host}
              extra={<Switch checked onChange={() => handleDisconnect(host)} />}
              title={host}
              hoverable
            />
          ))}
        </List>
      </PageContent>
      <PageFooter alignItems="center">
        <Button
          onClick={() =>
            clearSessions({ vaultId: shouldBePresent(currentVaultId) })
          }
          shape="round"
          size="large"
          type="primary"
          block
        >
          {t('disconnect_all')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
