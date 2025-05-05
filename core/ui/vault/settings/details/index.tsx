import { getKeygenThreshold } from '@core/mpc/getKeygenThreshold'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Divider } from '@lib/ui/divider'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { useTranslation } from 'react-i18next'

export const VaultDetailsPage = () => {
  const { t } = useTranslation()
  const { name, publicKeys, signers, localPartyId, libType } = useCurrentVault()
  const totalSigners = signers.length
  const localPartyIndex = signers.indexOf(localPartyId) + 1
  const threshold = getKeygenThreshold(totalSigners)

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('details')}</PageHeaderTitle>}
        hasBorder
      />
      <PageContent gap={16} flexGrow scrollable>
        <List>
          <ListItem title={t('vault_name')} description={name} />
          <ListItem
            title={t('vault_part')}
            description={`${t('share')} ${localPartyIndex} ${t('of')} ${totalSigners}`}
          />
          <ListItem
            title={t('vault_details_page_vault_type')}
            description={libType}
          />
          <ListItem
            title={t('vault_details_page_vault_ECDSA')}
            description={publicKeys.ecdsa}
          />
          <ListItem
            title={t('vault_details_page_vault_EDDSA')}
            description={publicKeys.eddsa}
          />
        </List>
        <Divider text={t('m_of_n_vault', { n: totalSigners, m: threshold })} />
        <List>
          {signers.map((signer, index) => (
            <ListItem
              key={index}
              title={`${t('vault_details_page_signer_word')} ${index + 1}: ${signer}${signer === localPartyId ? ` (${t('this_device')})` : ''}`}
            />
          ))}
        </List>
      </PageContent>
    </VStack>
  )
}
