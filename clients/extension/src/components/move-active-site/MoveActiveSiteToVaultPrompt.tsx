import { VaultAppSession } from '@core/extension/storage/appSessions'
import { useSetExclusiveVaultAppSessionMutation } from '@core/extension/storage/hooks/appSessions'
import { getAppSession } from '@core/inpage-provider/background/core/appSession'
import { useCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { useVaults } from '@core/ui/storage/vaults'
import { takePickedVaultId } from '@core/ui/vaultsOrganisation/pickedVault'
import { Button } from '@lib/ui/buttons/Button'
import { ChainLinkIcon3 } from '@lib/ui/icons/ChainLinkIcon3'
import { HStack } from '@lib/ui/layout/Stack'
import { PromptSheet, PromptSheetIcon } from '@lib/ui/sheet/PromptSheet'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import {
  getVaultId,
  isKeyImportVault,
  Vault,
} from '@vultisig/core-mpc/vault/Vault'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const LinkInPrompt = styled(ChainLinkIcon3)`
  font-size: 24px;
  color: ${getColor('primaryAlt')};
`

const getActiveTabSiteSession = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  return tab?.url ? ((await getAppSession(tab.url)) ?? null) : null
}

type MoveSiteInput = {
  site: VaultAppSession
  vaultId: string
}

type CanVaultServeChainsInput = {
  vault: Vault
  chains: Chain[] | undefined
}

const canVaultServeChains = ({ vault, chains }: CanVaultServeChainsInput) =>
  !isKeyImportVault(vault) ||
  (chains !== undefined &&
    chains.every(chain => !!vault.chainPublicKeys?.[chain]))

/**
 * After the user picks another vault in the vault list, offers to move the
 * site open in the active tab to that vault when it is connected with another
 * one and the picked vault has keys for the site's chains. Other sites keep
 * the vault they connected with.
 */
export const MoveActiveSiteToVaultPrompt = () => {
  const { t } = useTranslation()
  const currentVaultId = useCurrentVaultId()
  const vaults = useVaults()
  const [switchedToVaultId, setSwitchedToVaultId] = useState<string | null>(
    null
  )

  const dismiss = () => setSwitchedToVaultId(null)

  useEffect(() => {
    const pickedVaultId = takePickedVaultId()

    if (pickedVaultId !== null && pickedVaultId === currentVaultId) {
      setSwitchedToVaultId(pickedVaultId)
    }
  }, [currentVaultId])

  const { data: siteSession } = useQuery({
    queryKey: ['activeTabSiteSession', switchedToVaultId],
    queryFn: getActiveTabSiteSession,
    enabled: switchedToVaultId !== null,
    staleTime: Infinity,
    gcTime: 0,
  })

  const { mutateAsync: setExclusiveSession } =
    useSetExclusiveVaultAppSessionMutation()

  const { mutate: moveSite, isPending } = useMutation({
    mutationFn: async ({ site, vaultId }: MoveSiteInput) => {
      const storedSite = await getAppSession(site.url)

      if (!storedSite || storedSite.vaultId !== site.vaultId) return

      await setExclusiveSession({ ...storedSite, vaultId })
    },
    onSuccess: dismiss,
  })

  const findVault = (vaultId: string) =>
    vaults.find(vault => getVaultId(vault) === vaultId)

  const targetVault = switchedToVaultId ? findVault(switchedToVaultId) : null

  if (
    !switchedToVaultId ||
    !targetVault ||
    !siteSession ||
    siteSession.vaultId === switchedToVaultId ||
    !canVaultServeChains({
      vault: targetVault,
      chains: siteSession.authorizedChains,
    })
  ) {
    return null
  }

  return (
    <PromptSheet
      actions={
        <HStack fullWidth gap={12}>
          <Button kind="secondary" onClick={dismiss}>
            {t('keep')}
          </Button>
          <Button
            kind="primary"
            loading={isPending}
            onClick={() =>
              moveSite({ site: siteSession, vaultId: switchedToVaultId })
            }
          >
            {t('switch')}
          </Button>
        </HStack>
      }
      description={
        <Text centerHorizontally color="shy" height={20 / 14} size={14}>
          {t('move_site_to_vault_description', {
            site: siteSession.host,
            vault: findVault(siteSession.vaultId)?.name,
          })}
        </Text>
      }
      icon={
        <PromptSheetIcon>
          <LinkInPrompt />
        </PromptSheetIcon>
      }
      title={
        <Text centerHorizontally color="regular" variant="title3">
          {t('move_site_to_vault_title', {
            site: siteSession.host,
            vault: targetVault.name,
          })}
        </Text>
      }
      onClose={dismiss}
    />
  )
}
