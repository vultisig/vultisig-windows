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
import { getVaultSecurityTone } from '@core/ui/vaultsOrganisation/utils/getVaultSecurityTone'
import { Button } from '@lib/ui/buttons/Button'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { ContainImage } from '@lib/ui/images/ContainImage'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { usePotentialQuery } from '@lib/ui/query/hooks/usePotentialQuery'
import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useMutation } from '@tanstack/react-query'
import { hasServer } from '@vultisig/core-mpc/devices/localPartyId'
import {
  getVaultId,
  isKeyImportVault,
  Vault,
} from '@vultisig/core-mpc/vault/Vault'
import { match } from '@vultisig/lib-utils/match'
import { getUrlBaseDomain } from '@vultisig/lib-utils/url/baseDomain'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type ConnectView = 'connect' | 'picker'

const DappFavicon = styled(ContainImage)`
  ${sameDimensions(46)};
  ${round};
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const DomainTitle = styled(Text)`
  line-height: 24px;
`

const VaultAvatar = styled.div<{
  tone: 'primary' | 'warning'
}>`
  ${sameDimensions(28)};
  ${round};
  align-items: center;
  display: flex;
  font-size: 14px;
  justify-content: center;
  color: ${({ tone, theme }) =>
    match(tone, {
      primary: () => theme.colors.success.toCssValue(),
      warning: () => theme.colors.idle.toCssValue(),
    })};
  background: ${({ tone, theme }) => {
    const base = match(tone, {
      primary: () => theme.colors.success,
      warning: () => theme.colors.idle,
    })

    return base.withAlpha(0.16).toCssValue()
  }};
`

const ChangePill = styled.span`
  align-items: center;
  border: 1.5px solid ${getColor('foregroundExtra')};
  border-radius: 99px;
  color: ${getColor('textShy')};
  display: inline-flex;
  font-size: 12px;
  font-weight: 500;
  padding: 8px 12px;
`

const VaultRowIcon = ({ vault }: { vault: Vault }): ReactNode => {
  const { tone, icon } = getVaultSecurityTone(vault)
  return <VaultAvatar tone={tone}>{icon}</VaultAvatar>
}

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
  const hostKey = getUrlBaseDomain(requestOrigin)
  const displayDomain = hostKey

  const chainFilter = input.chain
  const eligibleVaults = chainFilter
    ? allVaults.filter(
        vault =>
          !isKeyImportVault(vault) || !!vault.chainPublicKeys?.[chainFilter]
      )
    : allVaults

  const defaultVaultId = pickDefaultVaultId({
    eligibleVaults,
    currentVaultId,
    preferFast: !!input.preselectFastVault,
  })

  const [userSelectedVaultId, setUserSelectedVaultId] = useState<
    string | undefined
  >(undefined)
  const [view, setView] = useState<ConnectView>('connect')
  const [hasAcknowledgedSiteRisk, setHasAcknowledgedSiteRisk] = useState(false)

  const userSelectionStillEligible =
    userSelectedVaultId !== undefined &&
    eligibleVaults.some(vault => getVaultId(vault) === userSelectedVaultId)
  const selectedVaultId = userSelectionStillEligible
    ? userSelectedVaultId
    : defaultVaultId

  const { mutateAsync: setExclusiveSession } =
    useSetExclusiveVaultAppSessionMutation()
  const { mutateAsync: setCurrentVaultId } = useSetCurrentVaultIdMutation()

  const { mutate: connect, isPending } = useMutation({
    mutationFn: async (vaultId: string) => {
      const [appSession] = await Promise.all([
        setExclusiveSession({
          vaultId,
          host: hostKey,
          url: requestOrigin,
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

  // A site Blockaid flags as malicious blocks connecting until the user
  // explicitly acknowledges the risk — gating both the Connect button and the
  // vault-picker so neither path can silently connect past the warning.
  const isMaliciousSite = siteScanQuery.data === 'malicious'
  const isSiteBlocked = isMaliciousSite && !hasAcknowledgedSiteRisk

  const canConnect =
    !isPending &&
    !siteScanQuery.isPending &&
    selectedVaultId !== undefined &&
    !isSiteBlocked
  const pickerLocked = isPending || siteScanQuery.isPending || isSiteBlocked

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
          {isMaliciousSite && (
            <WarningBlock>{t('risky_site_detected')}</WarningBlock>
          )}
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
                  hoverable={!pickerLocked}
                  onClick={
                    pickerLocked
                      ? undefined
                      : () => {
                          setUserSelectedVaultId(itemId)
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
          <DomainTitle color="contrast" size={22} weight={500}>
            {displayDomain}
          </DomainTitle>
          <Text color="supporting" size={14}>
            {t('connect_website_subtitle')}
          </Text>
          {isBlockaidEnabled && (
            <MatchQuery
              value={siteScanQuery}
              success={value => (
                <BlockaidSiteScanResult
                  value={value}
                  domain={displayDomain}
                  isRiskAcknowledged={hasAcknowledgedSiteRisk}
                  onAcknowledgeRisk={() => setHasAcknowledgedSiteRisk(true)}
                />
              )}
              pending={() => <BlockaidScanning />}
              error={() => <BlockaidNoScanStatus entity="site" />}
              inactive={() => <BlockaidScanStatusContainer />}
            />
          )}
        </VStack>
        {selectedVault && (
          <List radius={12}>
            <ListItem
              icon={<VaultRowIcon vault={selectedVault} />}
              title={selectedVault.name}
              extra={<ChangePill>{t('change')}</ChangePill>}
              showArrow
              onClick={() => setView('picker')}
            />
          </List>
        )}
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
      </PageContent>
    </VStack>
  )
}
