import { useTranslation } from 'react-i18next';

import { VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { PageSlice } from '../../../ui/page/PageSlice';
import { getVaultTypeText } from '../../../utils/util';
import { useCurrentVault } from '../../../vault/state/useCurrentVault';
import {
  AutoCenteredText,
  Container,
  ListItemPanel,
} from './VaultDetailsPage.styles';

const VaultDetailsPage = () => {
  const { t } = useTranslation();
  const currentVault = useCurrentVault();

  if (!currentVault) {
    return <></>;
  }

  const {
    name,
    public_key_eddsa,
    public_key_ecdsa,
    keyshares,
    signers,
    local_party_id,
  } = currentVault;

  // The value of the vault?

  const m = keyshares.length;

  const vaultTypeText = getVaultTypeText(m, t);

  return (
    <Container flexGrow gap={16}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>{t('vault_details_page_title')}</PageHeaderTitle>
        }
      />
      <PageSlice gap={12}>
        <ListItemPanel>
          <VStack fullWidth alignItems="start" justifyContent="space-between">
            <Text weight={900}>{t('vault_details_page_vault_name')}</Text>
            <Text size={13}>{name}</Text>
          </VStack>
        </ListItemPanel>
        <ListItemPanel>
          <VStack fullWidth alignItems="start" justifyContent="space-between">
            <Text weight={900}>{t('vault_details_page_vault_ECDSA')}</Text>
            <Text size={13}>{public_key_ecdsa}</Text>
          </VStack>
        </ListItemPanel>
        <ListItemPanel>
          <VStack fullWidth alignItems="start" justifyContent="space-between">
            <Text weight={900}>{t('vault_details_page_vault_EDDSA')}</Text>
            <Text size={13}>{public_key_eddsa}</Text>
          </VStack>
        </ListItemPanel>
        <AutoCenteredText weight={600} color="contrast">
          {vaultTypeText}
        </AutoCenteredText>
        {signers.map((signer, index) => (
          <ListItemPanel key={index}>
            <VStack fullWidth alignItems="start" justifyContent="space-between">
              <Text weight={900}>
                {signer} {signer === local_party_id && '(This device)'}
              </Text>
            </VStack>
          </ListItemPanel>
        ))}
      </PageSlice>
    </Container>
  );
};

export default VaultDetailsPage;
