import { HStack, VStack } from '../../lib/ui/layout/Stack';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { settingsItems } from './constants';
import { UnstyledButton } from '../../lib/ui/buttons/UnstyledButton';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  ListItemPanel,
  StyledVStack,
} from './SettingsVaultPage.styles';
import { Text } from '../../lib/ui/text';
import { ChevronRightIcon } from '../../lib/ui/icons/ChevronRightIcon';
import { useTranslation } from 'react-i18next';
import { PageSlice } from '../../ui/page/PageSlice';
import { ScrollableFlexboxFiller } from '../../lib/ui/layout/ScrollableFlexboxFiller';

const SettingsVaultPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Container fill gap={16}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        hasBorder
        title={
          <PageHeaderTitle>{t('vault_settings_page_title')}</PageHeaderTitle>
        }
      />
      <PageSlice data-testid="SettingsVaultPage-Container" fill>
        <VStack fill>
          <ScrollableFlexboxFiller>
            {settingsItems.map(({ sectionTitleKey, items }, index) => (
              <StyledVStack key={index} gap={12}>
                {sectionTitleKey && (
                  <Text weight={500} color="contrast">
                    {t(sectionTitleKey)}
                  </Text>
                )}
                {items.map(({ id, titleKey, icon: Icon, path }) => (
                  <UnstyledButton key={id} onClick={() => navigate(path)}>
                    <ListItemPanel>
                      <HStack
                        fullWidth
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <HStack gap={12}>
                          <Icon />
                          <Text>{t(titleKey)}</Text>
                        </HStack>
                        <ChevronRightIcon />
                      </HStack>
                    </ListItemPanel>
                  </UnstyledButton>
                ))}
              </StyledVStack>
            ))}
          </ScrollableFlexboxFiller>
        </VStack>
      </PageSlice>
    </Container>
  );
};

export default SettingsVaultPage;
