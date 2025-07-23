import { initializeMessenger } from '@clients/extension/src/messengers/initializeMessenger'
import { VaultExport } from '@clients/extension/src/utils/interfaces'
import { useVaults } from '@core/ui/storage/vaults'
import { getVaultPublicKeyExport } from '@core/ui/vault/share/utils/getVaultPublicKeyExport'
import { getVaultId } from '@core/ui/vault/Vault'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const backgroundMessenger = initializeMessenger({ connect: 'background' })

export const GetVaultsPage = () => {
  const { t } = useTranslation()
  const [vaultIds, setVaultIds] = useState<string[]>([])
  const vaults = useVaults()

  const handleClose = () => {
    window.close()
  }

  const handleSubmit = async () => {
    const selectedVaults = vaults
      .filter(vault => vaultIds.includes(getVaultId(vault)))
      .map(vault => {
        const {
          hex_chain_code,
          name,
          public_key_ecdsa,
          public_key_eddsa,
          uid,
        } = getVaultPublicKeyExport(vault)
        return {
          name,
          uid,
          hexChainCode: hex_chain_code,
          publicKeyEcdsa: public_key_ecdsa,
          publicKeyEddsa: public_key_eddsa,
        } as VaultExport
      })

    try {
      await backgroundMessenger.send('vaults:connect', {
        selectedVaults,
      })
    } catch (error) {
      console.error('Failed to send message to background:', error)
    }

    handleClose()
  }

  return vaults.length ? (
    <VStack fullHeight>
      <PageHeader
        secondaryControls={
          <IconButton onClick={handleClose}>
            <CrossIcon />
          </IconButton>
        }
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
        <Button disabled={!vaultIds.length} onClick={handleSubmit}>
          {t('connect')}
        </Button>
      </PageFooter>
    </VStack>
  ) : (
    <PageContent
      alignItems="center"
      gap={12}
      justifyContent="center"
      flexGrow
      scrollable
    >
      <Panel>
        <VStack alignItems="center" gap={24} justifyContent="center">
          <TriangleAlertIcon fontSize={36} />
          <VStack
            alignItems="center"
            gap={16}
            justifyContent="center"
            fullWidth
          >
            <Text size={17} weight={500} centerHorizontally>
              {t('no_vaults')}
            </Text>
            <Text color="light" size={14} weight={500} centerHorizontally>
              {t('no_vaults_desc')}
            </Text>
          </VStack>
        </VStack>
      </Panel>
    </PageContent>
  )
}
