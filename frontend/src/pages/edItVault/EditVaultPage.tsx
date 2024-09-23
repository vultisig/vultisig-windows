import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { UnstyledButton } from '../../lib/ui/buttons/UnstyledButton';
import { ChevronRightIcon } from '../../lib/ui/icons/ChevronRightIcon';
import { HStack, VStack } from '../../lib/ui/layout/Stack';
import { Text } from '../../lib/ui/text';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { PageSlice } from '../../ui/page/PageSlice';
import { useCurrentVault } from '../../vault/state/useCurrentVault';
import { editVaultSettingsItems } from './constants';
import {
  AutoCenteredTitle,
  Container,
  IconWrapper,
  ListItemPanel,
  TextWrapper,
} from './EditVaultPage.styles';

const EditVaultPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentVault = useCurrentVault();

  if (!currentVault) {
    return <></>;
  }

  const { local_party_id } = currentVault;

  return (
    <Container flexGrow gap={16}>
      <PageHeader
        data-testid="EditVaultPage-PageHeader"
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('vault_edit_page_title')}</PageHeaderTitle>}
      />
      <PageSlice>
        <AutoCenteredTitle size={18} color="contrast" weight={500}>
          {local_party_id}
        </AutoCenteredTitle>
        <VStack flexGrow gap={12}>
          {editVaultSettingsItems.map(
            ({ path, titleKey, subtitleKey, icon: Icon, textColor }, index) => (
              <UnstyledButton key={index} onClick={() => navigate(path)}>
                <ListItemPanel>
                  <HStack
                    fullWidth
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <HStack gap={18}>
                      <IconWrapper>
                        <Icon />
                      </IconWrapper>
                      <TextWrapper>
                        <Text
                          size={14}
                          weight="500"
                          color={textColor || 'contrast'}
                        >
                          {t(titleKey)}
                        </Text>
                        <Text size={12} color={textColor || 'supporting'}>
                          {t(subtitleKey)}
                        </Text>
                      </TextWrapper>
                    </HStack>
                    <ChevronRightIcon />
                  </HStack>
                </ListItemPanel>
              </UnstyledButton>
            )
          )}
        </VStack>
      </PageSlice>
    </Container>
  );
};

export default EditVaultPage;
