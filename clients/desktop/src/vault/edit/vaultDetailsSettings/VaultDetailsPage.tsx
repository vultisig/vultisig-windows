import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { PageSlice } from '@lib/ui/page/PageSlice'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { getVaultTypeText } from '../../../utils/util'
import { getVaultParticipantInfoFormattedForUI } from '../../../vault/utils/helpers'
import {
  AutoCenteredText,
  Container,
  ListItemPanel,
} from './VaultDetailsPage.styles'

const VaultDetailsPage = () => {
  const { t } = useTranslation()
  const currentVault = useCurrentVault()

  if (!currentVault) {
    return <></>
  }

  const { name, publicKeys, signers, localPartyId, libType } = currentVault
  const { localPartyIndex, totalSigners } =
    getVaultParticipantInfoFormattedForUI({
      signers,
      localPartyId,
    })

  const vaultTypeText = getVaultTypeText(signers.length, t)

  return (
    <Container flexGrow gap={16}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('details')}</PageHeaderTitle>}
      />
      <PageSlice gap={12}>
        <ListItemPanel>
          <VStack fullWidth alignItems="start" justifyContent="space-between">
            <Text weight={900}>{t('vault_name')}</Text>
            <Text color="supporting" size={13}>
              {name}
            </Text>
          </VStack>
        </ListItemPanel>
        <ListItemPanel>
          <VStack fullWidth alignItems="start" justifyContent="space-between">
            <Text weight={900}>{t('vault_part')}</Text>
            <Text color="supporting" size={13}>
              {t('share')} {localPartyIndex} {t('of')} {totalSigners}
            </Text>
          </VStack>
        </ListItemPanel>
        <ListItemPanel>
          <VStack fullWidth alignItems="start" justifyContent="space-between">
            <Text weight={900}>{t('vault_details_page_vault_type')}</Text>
            <Text color="supporting" size={13}>
              {libType}
            </Text>
          </VStack>
        </ListItemPanel>
        <ListItemPanel>
          <VStack fullWidth alignItems="start" justifyContent="space-between">
            <Text weight={900}>{t('vault_details_page_vault_ECDSA')}</Text>
            <Text color="supporting" size={13}>
              {publicKeys.ecdsa}
            </Text>
          </VStack>
        </ListItemPanel>
        <ListItemPanel>
          <VStack fullWidth alignItems="start" justifyContent="space-between">
            <Text weight={900}>{t('vault_details_page_vault_EDDSA')}</Text>
            <Text color="supporting" size={13}>
              {publicKeys.eddsa}
            </Text>
          </VStack>
        </ListItemPanel>
        <AutoCenteredText weight={600} color="contrast">
          {vaultTypeText}
        </AutoCenteredText>
        {signers.map((signer, index) => (
          <ListItemPanel key={index}>
            <VStack fullWidth alignItems="start" justifyContent="space-between">
              <Text color="supporting" weight={900} size={13}>
                {t('vault_details_page_signer_word')} {index + 1}: {signer}{' '}
                {signer === localPartyId && `(${t('this_device')})`}
              </Text>
            </VStack>
          </ListItemPanel>
        ))}
      </PageSlice>
    </Container>
  )
}

export default VaultDetailsPage
