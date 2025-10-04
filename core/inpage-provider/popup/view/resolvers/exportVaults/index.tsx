import { PopupResolver } from '@core/inpage-provider/popup/view/resolver'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useVaults } from '@core/ui/storage/vaults'
import { toVaultExport } from '@core/ui/vault/export/core/toVaultExport'
import { getVaultId } from '@core/ui/vault/Vault'
import { Button } from '@lib/ui/buttons/Button'
import { Switch } from '@lib/ui/inputs/switch'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const ExportVaults: PopupResolver<'exportVaults'> = ({
  onFinish,
  context: { requestOrigin },
}) => {
  const { t } = useTranslation()
  const [vaultIds, setVaultIds] = useState<string[]>([])
  const vaults = useVaults()

  const onSubmit = useCallback(() => {
    onFinish({
      result: {
        data: vaultIds.map(vaultId => {
          const vault = shouldBePresent(
            vaults.find(vault => getVaultId(vault) === vaultId)
          )

          return toVaultExport(vault)
        }),
      },
      shouldClosePopup: true,
    })
  }, [onFinish, vaultIds, vaults])

  return (
    <VStack fullHeight>
      <PageHeader
        secondaryControls={<PageHeaderBackButton />}
        title={
          <Text color="contrast" size={18} weight={500}>
            {t('connect_to_site', { site: getUrlBaseDomain(requestOrigin) })}
          </Text>
        }
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        <List>
          {vaults.map(item => {
            const itemId = getVaultId(item)
            const checked = vaultIds.includes(itemId)

            return (
              <ListItem
                extra={<Switch checked={checked} />}
                key={itemId}
                title={item.name}
                onClick={() =>
                  setVaultIds(vaultIds =>
                    checked
                      ? vaultIds.filter(id => id !== itemId)
                      : [...vaultIds, itemId]
                  )
                }
                hoverable
              />
            )
          })}
        </List>
      </PageContent>
      <PageFooter>
        <Button disabled={!vaultIds.length} onClick={onSubmit}>
          {t('connect')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
