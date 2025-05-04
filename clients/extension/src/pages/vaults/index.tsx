import { Button } from '@clients/extension/src/components/button'
import { AppProviders } from '@clients/extension/src/providers/AppProviders'
import { useVaults } from '@core/ui/storage/vaults'
import { getVaultPublicKeyExport } from '@core/ui/vault/share/utils/getVaultPublicKeyExport'
import { getVaultId } from '@core/ui/vault/Vault'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { StrictMode, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useTranslation } from 'react-i18next'

import { initializeMessenger } from '../../messengers/initializeMessenger'
import { VaultExport } from '../../utils/interfaces'

const App = () => {
  const { t } = useTranslation()
  const [vaultIds, setVaultIds] = useState<string[]>([])
  const vaults = useVaults()
  const backgroundMessenger = initializeMessenger({ connect: 'background' })
  const handleClose = () => {
    window.close()
  }

  const handleSubmit = async () => {
    if (vaultIds.length) {
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
      await backgroundMessenger.send('vaults:connect', {
        selectedVaults,
      })
      handleClose()
    }
  }

  return vaults.length ? (
    <VStack fullHeight>
      <PageHeader
        secondaryControls={
          <Button onClick={handleClose} ghost>
            <CrossIcon fontSize={20} />
          </Button>
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
        <Button
          onClick={handleSubmit}
          shape="round"
          size="large"
          type="primary"
          block
        >
          {t('connect')}
        </Button>
      </PageFooter>
    </VStack>
  ) : (
    <></>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
)
