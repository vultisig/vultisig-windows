import { Button } from '@clients/extension/src/components/button'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'
import { ShareIcon } from '@lib/ui/icons/ShareIcon'
import { SquarePenIcon } from '@lib/ui/icons/SquarePenIcon'
import { TrashIcon } from '@lib/ui/icons/TrashIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const VaultSettingsPage = () => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()
  const navigateBack = useNavigateBack()
  const vault = useCurrentVault()

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
            {vault.name}
          </Text>
        }
        hasBorder
      />
      <PageContent flexGrow scrollable>
        <List>
          <ListItem
            icon={<CircleInfoIcon fontSize={20} />}
            onClick={() => navigate({ id: 'vaultDetails' })}
            title={t('details')}
            hoverable
            showArrow
          />
          <ListItem
            icon={<SquarePenIcon fontSize={20} />}
            onClick={() => navigate({ id: 'renameVault' })}
            title={t('rename')}
            hoverable
            showArrow
          />
          <ListItem
            icon={<TrashIcon fontSize={20} />}
            onClick={() => navigate({ id: 'deleteVault' })}
            status="error"
            title={t('delete')}
            hoverable
            showArrow
          />
          <ListItem
            icon={<ShareIcon fontSize={20} />}
            onClick={() => navigate({ id: 'reshareVault' })}
            title={t('reshare')}
            hoverable
            showArrow
          />
        </List>
      </PageContent>
    </VStack>
  )
}
