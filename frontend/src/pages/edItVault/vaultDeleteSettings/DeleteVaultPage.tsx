import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import DangerSignRedIcon from '../../../lib/ui/icons/DangerSignRedIcon';
import { HStack, VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { makeAppPath } from '../../../navigation';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { PageSlice } from '../../../ui/page/PageSlice';
import { getVaultTypeText } from '../../../utils/util';
import { useDeleteVaultMutation } from '../../../vault/mutations/useDeleteVaultMutation';
import { useVaultTotalBalanceQuery } from '../../../vault/queries/useVaultTotalBalanceQuery';
import { useUnassertedCurrentVault } from '../../../vault/state/useCurrentVault';
import {
  ActionsWrapper,
  Check,
  Container,
  DeleteButton,
  ListItemPanel,
} from './DeleteVaultPage.styles';

const DeleteVaultPage = () => {
  const [deleteTerms, setDeleteTerms] = useState({
    firstTermAccepted: false,
    secondTermAccepted: false,
    thirdTermAccepted: false,
  });

  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentVault = useUnassertedCurrentVault();
  const { data: vaultBalance } = useVaultTotalBalanceQuery();
  const {
    mutate: deleteVault,
    isPending,
    error,
    isSuccess,
  } = useDeleteVaultMutation();

  useEffect(() => {
    if (isSuccess) {
      navigate(makeAppPath('vaultList'));
    }
  }, [isSuccess, navigate]);

  if (!currentVault) {
    return <></>;
  }

  const {
    name,
    public_key_eddsa,
    public_key_ecdsa,
    keyshares,
    local_party_id,
  } = currentVault;

  const m = keyshares.length;
  const vaultTypeText = getVaultTypeText(m, t);

  return (
    <Container flexGrow gap={16}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>
            {t('vault_delete_page_header_title')}
          </PageHeaderTitle>
        }
      />
      <PageSlice gap={32} flexGrow={true}>
        <VStack gap={16} justifyContent="center" alignItems="center">
          <DangerSignRedIcon />
          <Text size={16} color="contrast" weight="700">
            {t('vault_delete_page_header_subtitle')}
          </Text>
        </VStack>
        <VStack flexGrow={true} justifyContent="space-between">
          <ListItemPanel>
            <VStack gap={10}>
              <HStack gap={8}>
                <Text size={22} weight={600}>
                  {t('vault_delete_page_header_details')}:
                </Text>
              </HStack>
              <HStack gap={8}>
                <Text weight={600}>{t('vault_delete_page_vault_name')}:</Text>
                <Text size={14}>{name}</Text>
              </HStack>
              <HStack gap={8}>
                <Text weight={600}>{t('vault_delete_page_vault_value')}:</Text>
                <Text size={14}>{vaultBalance}</Text>
              </HStack>
              <HStack gap={8}>
                <Text weight={600}>{t('vault_delete_page_vault_type')}:</Text>
                <Text size={14}>{vaultTypeText}</Text>
              </HStack>
              <HStack gap={8}>
                <Text weight={600}>{t('vault_delete_page_device_id')}:</Text>
                <Text size={14}>{local_party_id}</Text>
              </HStack>
              <HStack gap={8}>
                <Text weight={600}>{t('vault_delete_page_ecdsa_key')}:</Text>
                <Text size={14}>{public_key_ecdsa}</Text>
              </HStack>
              <HStack gap={8}>
                <Text weight={600}>{t('vault_delete_page_eddsa_key')}:</Text>
                <Text size={14}>{public_key_eddsa}</Text>
              </HStack>
            </VStack>
          </ListItemPanel>
          <VStack>
            <ActionsWrapper gap={16}>
              <HStack
                onClick={() =>
                  setDeleteTerms({
                    ...deleteTerms,
                    firstTermAccepted: !deleteTerms.firstTermAccepted,
                  })
                }
                as="button"
                alignItems="center"
                gap={8}
              >
                <Check value={deleteTerms.firstTermAccepted} />
                <Text color="contrast">{t('vault_delete_page_term_1')}</Text>
              </HStack>
              <HStack
                onClick={() =>
                  setDeleteTerms({
                    ...deleteTerms,
                    secondTermAccepted: !deleteTerms.secondTermAccepted,
                  })
                }
                as="button"
                alignItems="center"
                gap={8}
              >
                <Check value={deleteTerms.secondTermAccepted} />
                <Text color="contrast">{t('vault_delete_page_term_2')}</Text>
              </HStack>
              <HStack
                onClick={() =>
                  setDeleteTerms({
                    ...deleteTerms,
                    thirdTermAccepted: !deleteTerms.thirdTermAccepted,
                  })
                }
                as="button"
                alignItems="center"
                gap={8}
              >
                <Check value={deleteTerms.thirdTermAccepted} />
                <Text color="contrast">{t('vault_delete_page_term_3')}</Text>
              </HStack>
            </ActionsWrapper>
            <DeleteButton
              isLoading={isPending}
              onClick={() => deleteVault(public_key_ecdsa)}
              color="danger"
              isDisabled={
                !deleteTerms.firstTermAccepted ||
                !deleteTerms.secondTermAccepted ||
                !deleteTerms.thirdTermAccepted
              }
            >
              {t('vault_delete_button_text')}
            </DeleteButton>
            {error && (
              <Text size={12} color="danger">
                {error?.message}
              </Text>
            )}
          </VStack>
        </VStack>
      </PageSlice>
    </Container>
  );
};

export default DeleteVaultPage;
