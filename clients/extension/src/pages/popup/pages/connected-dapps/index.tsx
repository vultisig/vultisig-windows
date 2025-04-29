import { Button } from '@clients/extension/src/components/button'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const ConnectedDappsPage = () => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          <Button onClick={() => navigate('root')} ghost>
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
          <ListItem
            extra={<Switch onChange={() => {}} />}
            title={''}
            hoverable
          />
        </List>
      </PageContent>
      <PageFooter alignItems="center">
        <Button
          onClick={() => {}}
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
