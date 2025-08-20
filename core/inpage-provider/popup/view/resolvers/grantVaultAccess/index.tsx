import { useAddVaultAppSessionMutation } from '@core/extension/storage/hooks/appSessions'
import { PopupResolver } from '@core/inpage-provider/popup/view/resolver'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useVaults } from '@core/ui/storage/vaults'
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
import { getUrlHost } from '@lib/utils/url/host'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const GrantVaultAccess: PopupResolver<'grantVaultAccess'> = ({
  onFinish,
  context,
}) => {
  const { t } = useTranslation()
  const [vaultId, setVaultId] = useState<string | undefined>(undefined)
  const vaults = useVaults()
  const { mutate: addAppSession } = useAddVaultAppSessionMutation({
    onSuccess: appSession => {
      onFinish({ data: { appSession } })
    },
  })
  const { requestOrigin } = shouldBePresent(context)

  const submitButtonProps = useMemo(() => {
    if (!vaultId) {
      return { disabled: true }
    }

    return {
      onClick: () =>
        addAppSession({
          vaultId,
          host: getUrlBaseDomain(requestOrigin),
          url: getUrlHost(requestOrigin),
        }),
    }
  }, [addAppSession, requestOrigin, vaultId])

  return (
    <VStack fullHeight>
      <PageHeader
        secondaryControls={<PageHeaderBackButton />}
        title={
          <Text color="contrast" size={18} weight={500}>
            {t('connect_with_vultisig')}
          </Text>
        }
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        <List>
          {vaults.map(item => {
            const itemId = getVaultId(item)

            return (
              <ListItem
                extra={<Switch checked={itemId === vaultId} />}
                key={itemId}
                title={item.name}
                onClick={() => setVaultId(itemId)}
                hoverable
              />
            )
          })}
        </List>
      </PageContent>
      <PageFooter>
        <Button {...submitButtonProps}>{t('connect')}</Button>
      </PageFooter>
    </VStack>
  )
}
