import { Button } from '@clients/extension/src/components/button'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { useDeleteVaultMutation } from '@clients/extension/src/vault/mutations/useDeleteVaultMutation'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

const Component = () => {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const navigate = useAppNavigate()
  const currentVault = useCurrentVault()
  const deleteVault = useDeleteVaultMutation()

  const handleSubmit = () => {
    if (!deleteVault.isPending) {
      deleteVault.mutateAsync(getVaultId(currentVault)).then(() => {
        navigate('root')
      })
    }
  }

  return (
    <VStack fullHeight>
      <PageHeader
        hasBorder
        primaryControls={
          <Button onClick={() => navigate('vaultSettings')} ghost>
            <ChevronLeftIcon fontSize={20} />
          </Button>
        }
        title={
          <Text color="contrast" size={18} weight={500}>
            {t('remove_vault')}
          </Text>
        }
      />
      <PageContent gap={24} alignItems="center" flexGrow scrollable>
        <TriangleAlertIcon fontSize={66} stroke={colors.alertWarning.toHex()} />
        <Text color="contrast" size={16} weight={700}>
          {`${t('removing_vault_warning')}:`}
        </Text>
        <Text color="contrast" size={16}>
          {currentVault.name}
        </Text>
      </PageContent>
      <PageFooter>
        <Button
          loading={deleteVault.isPending}
          onClick={handleSubmit}
          shape="round"
          size="large"
          type="primary"
          block
        >
          {t('remove')}
        </Button>
      </PageFooter>
    </VStack>
  )
}

export default Component
