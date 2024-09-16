import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { UnstyledButton } from '../../lib/ui/buttons/UnstyledButton';
import { ChevronRightIcon } from '../../lib/ui/icons/ChevronRightIcon';
import DiscordIcon from '../../lib/ui/icons/DiscordIcon';
import GithubIcon from '../../lib/ui/icons/GithubIcon';
import TwitterIcon from '../../lib/ui/icons/TwitterIcon';
import { ScrollableFlexboxFiller } from '../../lib/ui/layout/ScrollableFlexboxFiller';
import { HStack, VStack } from '../../lib/ui/layout/Stack';
import { Text } from '../../lib/ui/text';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import {
  settingsItems,
  VULTISIG_DISCORD_LINK,
  VULTISIG_GITHUB_LINK,
  VULTISIG_TWITTER_LINK,
} from './constants';
import {
  Container,
  Footer,
  ListItemPanel,
  StyledPageSlice,
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
      <ScrollableFlexboxFiller>
        <StyledPageSlice data-testid="SettingsVaultPage-Container" flexGrow>
          <VStack flexGrow>
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
          </VStack>
          <Footer>
            <HStack gap={24}>
              <a href={VULTISIG_GITHUB_LINK} target="_blank" rel="noreferrer">
                <GithubIcon />
              </a>
              <a href={VULTISIG_TWITTER_LINK} target="_blank" rel="noreferrer">
                <TwitterIcon />
              </a>
              <a href={VULTISIG_DISCORD_LINK} target="_blank" rel="noreferrer">
                <DiscordIcon />
              </a>
            </HStack>
            <VStack alignItems="center">
              <Text size={14} color="primary" weight="600">
                {t('settings_vault_page_footer')}1.0
              </Text>
              <Text size={14} color="primary" weight="600">
                (BUILD 50)
              </Text>
            </VStack>
          </Footer>
        </StyledPageSlice>
      </ScrollableFlexboxFiller>
    </Container>
  );
};

export default SettingsVaultPage;
