import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import {
  Container,
  IconWrapper,
  ListItemPanel,
  TextWrapper,
} from './EditVaultPage.styles';
import { HStack, VStack } from '../../lib/ui/layout/Stack';
import { Text } from '../../lib/ui/text';
import { UnstyledButton } from '../../lib/ui/buttons/UnstyledButton';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon } from '../../lib/ui/icons/ChevronRightIcon';
import { editVaultSettingsItems } from './constants';
import { PageSlice } from '../../ui/page/PageSlice';

const EditVaultPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Container flexGrow gap={16}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        hasBorder
        title={<PageHeaderTitle>{t('vault_edit_page_title')}</PageHeaderTitle>}
      />
      <PageSlice>
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
