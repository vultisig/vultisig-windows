import { Button } from '@clients/extension/src/components/button'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
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
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const StyledIcon = styled(TrashIcon)`
  color: ${getColor('alertError')};
`

export const VaultSettingsPage = () => {
  const { t } = useTranslation()
  const coreNavigate = useCoreNavigate()
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
            onClick={() => coreNavigate('vaultDetails')}
            title={t('details')}
            hoverable
            showArrow
          />
          <ListItem
            icon={<SquarePenIcon fontSize={20} />}
            onClick={() => coreNavigate('renameVault')}
            title={t('rename')}
            hoverable
            showArrow
          />
          <ListItem
            icon={<StyledIcon fontSize={20} />}
            onClick={() => navigate('deleteVault')}
            status="error"
            title={t('delete')}
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
