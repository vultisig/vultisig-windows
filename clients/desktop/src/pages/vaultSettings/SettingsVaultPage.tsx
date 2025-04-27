import { useFiatCurrency } from '@core/ui/state/fiatCurrency'
import { useOpenUrl } from '@core/ui/state/openUrl'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import DiscordIcon from '@lib/ui/icons/DiscordIcon'
import GithubIcon from '@lib/ui/icons/GithubIcon'
import TwitterIcon from '@lib/ui/icons/TwitterIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { ScrollableFlexboxFiller } from '../../lib/ui/layout/ScrollableFlexboxFiller'
import { NavigateToDklsPage } from '../../mpc/dkls/NavigateToDklsPage'
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'
import { useLanguage } from '../../preferences/state/language'
import {
  getTranslatedSettingsItems,
  VULTISIG_DISCORD_LINK,
  VULTISIG_GITHUB_LINK,
  VULTISIG_PRIVACY_POLICY_LINK,
  VULTISIG_SHARE_APP_LINK,
  VULTISIG_TERMS_OF_SERVICE_LINK,
  VULTISIG_TWITTER_LINK,
} from './constants'
import {
  Container,
  Footer,
  IconWrapper,
  ListItemPanel,
  OpticallyAdjustedText,
  StyledListItemContentWrapper,
  StyledPageSlice,
  StyledVStack,
} from './SettingsVaultPage.styles'

const SettingsVaultPage = () => {
  const navigate = useAppNavigate()
  const { t } = useTranslation()

  const fiatCurrency = useFiatCurrency()
  const [language] = useLanguage()
  const translatedSettingsItems = getTranslatedSettingsItems(t)

  const openUrl = useOpenUrl()

  return (
    <Container flexGrow gap={16}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        hasBorder
        title={<PageHeaderTitle>{t('settings')}</PageHeaderTitle>}
      />
      <ScrollableFlexboxFiller>
        <StyledPageSlice data-testid="SettingsVaultPage-Container" flexGrow>
          <VStack flexGrow>
            {translatedSettingsItems.map(({ sectionTitle, items }, index) => (
              <StyledVStack key={index} gap={12}>
                {sectionTitle && (
                  <Text weight={500} color="contrast">
                    {sectionTitle}
                  </Text>
                )}
                {items.map(({ id, title, icon: Icon, path }) => (
                  <UnstyledButton
                    key={id}
                    onClick={() => {
                      if (id === 'privacy-policy') {
                        openUrl(VULTISIG_PRIVACY_POLICY_LINK)
                      } else if (id === 'terms-of-service') {
                        openUrl(VULTISIG_TERMS_OF_SERVICE_LINK)
                      } else if (id === 'share-app') {
                        openUrl(VULTISIG_SHARE_APP_LINK)
                      } else {
                        navigate(path)
                      }
                    }}
                  >
                    <ListItemPanel
                      isSpecialItem={id === 'register-for-airdrop'}
                    >
                      <StyledListItemContentWrapper
                        fullWidth
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <HStack gap={12}>
                          <IconWrapper>
                            <Icon />
                          </IconWrapper>
                          <OpticallyAdjustedText>{title}</OpticallyAdjustedText>
                        </HStack>
                        {id === 'language' || id === 'currency' ? (
                          <HStack gap={8} alignItems="center">
                            <Text size={14} color="contrast">
                              {id === 'language'
                                ? t(
                                    `vault_settings_language_settings_title_${language}`
                                  )
                                : fiatCurrency}
                            </Text>
                            <ChevronRightIcon />
                          </HStack>
                        ) : (
                          <ChevronRightIcon />
                        )}
                      </StyledListItemContentWrapper>
                    </ListItemPanel>
                  </UnstyledButton>
                ))}
              </StyledVStack>
            ))}
          </VStack>
          <Footer>
            <HStack gap={24}>
              <UnstyledButton onClick={() => openUrl(VULTISIG_GITHUB_LINK)}>
                <GithubIcon />
              </UnstyledButton>
              <UnstyledButton onClick={() => openUrl(VULTISIG_TWITTER_LINK)}>
                <TwitterIcon />
              </UnstyledButton>
              <UnstyledButton onClick={() => openUrl(VULTISIG_DISCORD_LINK)}>
                <DiscordIcon />
              </UnstyledButton>
            </HStack>
            <NavigateToDklsPage>
              <VStack alignItems="center">
                <Text size={14} color="primary" weight="600">
                  {t('settings_vault_page_footer')}
                  {__APP_VERSION__}
                </Text>
                <Text size={14} color="primary" weight="600">
                  (BUILD {__APP_BUILD__})
                </Text>
              </VStack>
            </NavigateToDklsPage>
          </Footer>
        </StyledPageSlice>
      </ScrollableFlexboxFiller>
    </Container>
  )
}

export default SettingsVaultPage
