import { useSetExclusiveVaultAppSessionMutation } from '@core/extension/storage/hooks/appSessions'
import { PopupResolver } from '@core/inpage-provider/popup/view/resolver'
import { BlockaidNoScanStatus } from '@core/ui/chain/security/blockaid/scan/BlockaidNoScanStatus'
import { BlockaidScanning } from '@core/ui/chain/security/blockaid/scan/BlockaidScanning'
import { BlockaidScanStatusContainer } from '@core/ui/chain/security/blockaid/scan/BlockaidScanStatusContainer'
import { BlockaidSiteScanResult } from '@core/ui/chain/security/blockaid/site/BlockaidSiteScanResult'
import { getBlockaidSiteScanQuery } from '@core/ui/chain/security/blockaid/site/queries/blockaidSiteScan'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useIsBlockaidEnabled } from '@core/ui/storage/blockaid'
import { useSetCurrentVaultIdMutation } from '@core/ui/storage/currentVaultId'
import { useCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { useVaults } from '@core/ui/storage/vaults'
import { VaultSigners } from '@core/ui/vault/signers'
import { Button } from '@lib/ui/buttons/Button'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { ContainImage } from '@lib/ui/images/ContainImage'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { usePotentialQuery } from '@lib/ui/query/hooks/usePotentialQuery'
import { Text } from '@lib/ui/text'
import { useMutation } from '@tanstack/react-query'
import { hasServer } from '@vultisig/core-mpc/devices/localPartyId'
import {
  getVaultId,
  isKeyImportVault,
  Vault,
} from '@vultisig/core-mpc/vault/Vault'
import { getUrlBaseDomain } from '@vultisig/lib-utils/url/baseDomain'
import { getUrlHost } from '@vultisig/lib-utils/url/host'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type ConnectView = 'connect' | 'picker'

const DappFavicon = styled(ContainImage)`
  ${sameDimensions(64)};
  ${round};
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const pickDefaultVaultId = ({
  eligibleVaults,
  currentVaultId,
  preferFast,
}: {
  eligibleVaults: Vault[]
  currentVaultId: string | null
  preferFast: boolean
}): string | undefined => {
  const currentVault = currentVaultId
    ? eligibleVaults.find(vault => getVaultId(vault) === currentVaultId)
    : undefined

  if (preferFast) {
    if (currentVault && hasServer(currentVault.signers)) {
      return getVaultId(currentVault)
    }
    const firstFast = eligibleVaults.find(vault => hasServer(vault.signers))
    if (firstFast) {
      return getVaultId(firstFast)
    }
  }

  if (currentVault) {
    return getVaultId(currentVault)
  }

  const [firstEligible] = eligibleVaults
  return firstEligible ? getVaultId(firstEligible) : undefined
}

export const GrantVaultAccess: PopupResolver<'grantVaultAccess'> = ({
  input,
  onFinish,
  context: { requestOrigin, requestFavicon },
}) => {
  const { t } = useTranslation()
  const allVaults = useVaults()
  const currentVaultId = useCurrentVaultId()
  const isBlockaidEnabled = useIsBlockaidEnabled()
  const domain = getUrlBaseDomain(requestOrigin)

  const chainFilter = input.chain
  const eligibleVaults = chainFilter
    ? allVaults.filter(
        vault =>
          !isKeyImportVault(vault) || !!vault.chainPublicKeys?.[chainFilter]
      )
    : allVaults

  const [selectedVaultId, setSelectedVaultId] = useState<string | undefined>(
    () =>
      pickDefaultVaultId({
        eligibleVaults,
        currentVaultId,
        preferFast: !!input.preselectFastVault,
      })
  )
  const [view, setView] = useState<ConnectView>('connect')

  const { mutateAsync: setExclusiveSession } =
    useSetExclusiveVaultAppSessionMutation()
  const { mutateAsync: setCurrentVaultId } = useSetCurrentVaultIdMutation()

  const { mutate: connect, isPending } = useMutation({
    mutationFn: async (vaultId: string) => {
      const [appSession] = await Promise.all([
        setExclusiveSession({
          vaultId,
          host: domain,
          url: getUrlHost(requestOrigin),
          icon: requestFavicon,
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

  const handleReject = () => {
    onFinish({
      result: { error: new Error('User rejected the request') },
      shouldClosePopup: true,
    })
  }

  const selectedVault = selectedVaultId
    ? eligibleVaults.find(vault => getVaultId(vault) === selectedVaultId)
    : undefined

  const canConnect =
    !isPending && !siteScanQuery.isPending && selectedVaultId !== undefined

  const header = (
    <PageHeader
      primaryControls={
        view === 'picker' ? (
          <PageHeaderBackButton onClick={() => setView('connect')} />
        ) : (
          <PageHeaderBackButton onClick={handleReject} />
        )
      }
      title={
        <Text color="contrast" size={18} weight={500}>
          {t('connect_dapp')}
        </Text>
      }
      hasBorder
    />
  )

  if (view === 'picker') {
    return (
      <VStack fullHeight>
        {header}
        <PageContent gap={12} flexGrow scrollable>
          <Text color="supporting" size={12} weight={500}>
            {t('select_vault')}
          </Text>
          <List>
            {eligibleVaults.map(vault => {
              const itemId = getVaultId(vault)
              return (
                <ListItem
                  key={itemId}
                  title={vault.name}
                  extra={<VaultSigners vault={vault} />}
                  showArrow
                  hoverable={!isPending}
                  onClick={
                    isPending
                      ? undefined
                      : () => {
                          setSelectedVaultId(itemId)
                          connect(itemId)
                        }
                  }
                />
              )
            })}
          </List>
        </PageContent>
      </VStack>
    )
  }

  return (
    <VStack fullHeight>
      {header}
      <PageContent gap={24} flexGrow scrollable>
        <VStack alignItems="center" gap={12}>
          <SafeImage
            src={requestFavicon}
            render={props => <DappFavicon {...props} />}
          />
          <Text color="contrast" size={22} weight={500}>
            {domain}
          </Text>
          <Text color="supporting" size={14}>
            {t('connect_website_subtitle')}
          </Text>
          {isBlockaidEnabled && (
            <MatchQuery
              value={siteScanQuery}
              success={value => <BlockaidSiteScanResult value={value} />}
              pending={() => <BlockaidScanning />}
              error={() => <BlockaidNoScanStatus entity="site" />}
              inactive={() => <BlockaidScanStatusContainer />}
            />
          )}
        </VStack>
        {selectedVault && (
          <List>
            <ListItem
              title={selectedVault.name}
              extra={<VaultSigners vault={selectedVault} />}
              showArrow
              onClick={() => setView('picker')}
            />
          </List>
        )}
      </PageContent>
      <PageFooter>
        <HStack gap={12} fullWidth>
          <Button onClick={handleReject} kind="secondary">
            {t('cancel')}
          </Button>
          <Button
            onClick={() => selectedVaultId && connect(selectedVaultId)}
            loading={isPending}
            disabled={!canConnect}
          >
            {t('connect')}
          </Button>
        </HStack>
      </PageFooter>
    </VStack>
  )
}
