import { useAddVaultAppSessionMutation } from '@core/extension/storage/hooks/appSessions'
import { PopupResolver } from '@core/inpage-provider/popup/view/resolver'
import { BlockaidNoScanStatus } from '@core/ui/chain/security/blockaid/scan/BlockaidNoScanStatus'
import { BlockaidScanning } from '@core/ui/chain/security/blockaid/scan/BlockaidScanning'
import { BlockaidScanStatusContainer } from '@core/ui/chain/security/blockaid/scan/BlockaidScanStatusContainer'
import { BlockaidSiteScanResult } from '@core/ui/chain/security/blockaid/site/BlockaidSiteScanResult'
import { getBlockaidSiteScanQuery } from '@core/ui/chain/security/blockaid/site/queries/blockaidSiteScan'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useIsBlockaidEnabled } from '@core/ui/storage/blockaid'
import { useSetCurrentVaultIdMutation } from '@core/ui/storage/currentVaultId'
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
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { usePotentialQuery } from '@lib/ui/query/hooks/usePotentialQuery'
import { Text } from '@lib/ui/text'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'
import { getUrlHost } from '@lib/utils/url/host'
import { useMutation } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const GrantVaultAccess: PopupResolver<'grantVaultAccess'> = ({
  onFinish,
  context: { requestOrigin },
}) => {
  const { t } = useTranslation()
  const [vaultId, setVaultId] = useState<string | undefined>(undefined)
  const vaults = useVaults()
  const isBlockaidEnabled = useIsBlockaidEnabled()

  const { mutateAsync: addAppSession } = useAddVaultAppSessionMutation()
  const { mutateAsync: setCurrentVaultId } = useSetCurrentVaultIdMutation()
  const { mutate: sumbit, isPending } = useMutation({
    mutationFn: async (vaultId: string) => {
      const [appSession] = await Promise.all([
        addAppSession({
          vaultId,
          host: getUrlBaseDomain(requestOrigin),
          url: getUrlHost(requestOrigin),
        }),
        setCurrentVaultId(vaultId),
      ])

      return appSession
    },
    onSuccess: appSession => {
      onFinish({ result: { data: { appSession } }, shouldClosePopup: true })
    },
  })

  const siteScanQuery = usePotentialQuery(
    isBlockaidEnabled ? requestOrigin : undefined,
    getBlockaidSiteScanQuery
  )

  const submitButtonProps = useMemo(() => {
    if (isPending) {
      return { loading: true }
    }

    if (siteScanQuery.isPending || !vaultId) {
      return { disabled: true }
    }

    return {
      onClick: () => {
        sumbit(vaultId)
      },
    }
  }, [isPending, sumbit, vaultId, siteScanQuery.isPending])

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
        {isBlockaidEnabled && (
          <MatchQuery
            value={siteScanQuery}
            success={value => <BlockaidSiteScanResult value={value} />}
            pending={() => <BlockaidScanning />}
            error={() => <BlockaidNoScanStatus entity="site" />}
            inactive={() => <BlockaidScanStatusContainer />}
          />
        )}
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
