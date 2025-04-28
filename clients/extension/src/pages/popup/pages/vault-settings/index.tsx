import { Button } from '@clients/extension/src/components/button'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { ShareIcon } from '@lib/ui/icons/ShareIcon'
import { SquarePenIcon } from '@lib/ui/icons/SquarePenIcon'
import { TrashIcon } from '@lib/ui/icons/TrashIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

export const VaultSettingsPage = () => {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const coreNavigate = useCoreNavigate()
  const navigate = useAppNavigate()
  const vault = useCurrentVault()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          <Button onClick={() => navigate('settings')} ghost>
            <ChevronLeftIcon fontSize={20} />
          </Button>
        }
        title={
          <Text color="contrast" size={18} weight={500}>
            {vault.name}
          </Text>
        }
        hasBorder
      />
      <PageContent flexGrow scrollable>
        <List>
          <ListItem
            icon={<SquarePenIcon fontSize={20} />}
            onClick={() => navigate('renameVault')}
            title={t('rename_vault')}
            hoverable
            showArrow
          />
          <ListItem
            icon={
              <TrashIcon fontSize={20} stroke={colors.alertWarning.toHex()} />
            }
            onClick={() => navigate('deleteVault')}
            status="warning"
            title={t('remove_vault')}
            hoverable
            showArrow
          />
          <ListItem
            icon={<ShareIcon fontSize={20} />}
            onClick={() => coreNavigate('reshareVault')}
            title={t('reshare')}
            hoverable
            showArrow
          />
        </List>
      </PageContent>
    </VStack>
  )
}
