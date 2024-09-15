import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { UnstyledButton } from '../../lib/ui/buttons/UnstyledButton';
import { ChevronRightIcon } from '../../lib/ui/icons/ChevronRightIcon';
import { ScrollableFlexboxFiller } from '../../lib/ui/layout/ScrollableFlexboxFiller';
import { HStack, VStack } from '../../lib/ui/layout/Stack';
import { Text } from '../../lib/ui/text';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { PageSlice } from '../../ui/page/PageSlice';
import { settingsItems } from './constants';
import {
  Container,
  ListItemPanel,
  StyledVStack,
} from './SettingsVaultPage.styles';

const SettingsVaultPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Container flexGrow gap={16}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        hasBorder
        title={
          <PageHeaderTitle>{t('vault_settings_page_title')}</PageHeaderTitle>
        }
      />
      <PageSlice data-testid="SettingsVaultPage-Container" flexGrow>
        <VStack flexGrow>
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
