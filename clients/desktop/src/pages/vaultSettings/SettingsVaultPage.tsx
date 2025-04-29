import { useFiatCurrency } from '@core/ui/state/fiatCurrency'
import { useOpenUrl } from '@core/ui/state/openUrl'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import AddressBookIcon from '@lib/ui/icons/AddressBookIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import CurrencyCircleIcon from '@lib/ui/icons/CurrencyCircleIcon'
import DefaultChainsIcon from '@lib/ui/icons/DefaultChainsIcon'
import DiscordIcon from '@lib/ui/icons/DiscordIcon'
import DownloadIcon from '@lib/ui/icons/DownloadIcon'
import FaqIcon from '@lib/ui/icons/FaqIcon'
import GithubIcon from '@lib/ui/icons/GithubIcon'
import GlobeIcon from '@lib/ui/icons/GlobeIcon'
import NoteIcon from '@lib/ui/icons/NoteIcon'
import { SettingsIcon } from '@lib/ui/icons/SettingsIcon'
import { ShareIcon } from '@lib/ui/icons/ShareIcon'
import ShieldCheckIcon from '@lib/ui/icons/ShieldCheckIcon'
import TwitterIcon from '@lib/ui/icons/TwitterIcon'
import { VultisigLogoIcon } from '@lib/ui/icons/VultisigLogoIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { OnClickProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { ScrollableFlexboxFiller } from '../../lib/ui/layout/ScrollableFlexboxFiller'
import { NavigateToDklsPage } from '../../mpc/dkls/NavigateToDklsPage'
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'
import { useLanguage } from '../../preferences/state/language'
import {
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

type SettingItem = {
  id: string
  title: string
  icon: ReactNode
} & OnClickProp

type SettingSection = {
  items: SettingItem[]
  sectionTitle?: string
}

const SettingsVaultPage = () => {
  const navigate = useAppNavigate()
  const { t } = useTranslation()

  const fiatCurrency = useFiatCurrency()
  const [language] = useLanguage()

  const openUrl = useOpenUrl()

  const sections: SettingSection[] = [
    {
      items: [
        {
          id: 'vault-settings',
          title: t('settings'),
          icon: <SettingsIcon style={{ fontSize: 24 }} />,
          onClick: () => navigate('editVault'),
        },
        {
          id: 'language',
          title: t('language'),
          icon: <GlobeIcon />,
          onClick: () => navigate('languageSettings'),
        },
        {
          id: 'currency',
          title: t('currency'),
          icon: <CurrencyCircleIcon />,
          onClick: () => navigate('currencySettings'),
        },
        {
          id: 'address-book',
          title: t('vault_settings_address_book'),
          icon: <AddressBookIcon />,
          onClick: () => navigate('addressBook'),
        },
        {
          id: 'default-chains',
          title: t('vault_settings_default_chains'),
          icon: <DefaultChainsIcon />,
          onClick: () => navigate('defaultChains'),
        },
        {
          id: 'faq',
          title: t('faq'),
          icon: <FaqIcon />,
          onClick: () => navigate('faq'),
        },
      ],
    },
    {
      sectionTitle: t('other'),
      items: [
        {
          id: 'register-for-airdrop',
          title: t('vault_settings_register_for_airdrop'),
          icon: <VultisigLogoIcon />,
          onClick: () => navigate('registerForAirdrop'),
        },
        {
          id: 'share-app',
          title: t('vault_settings_share_app'),
          icon: <ShareIcon />,
          onClick: () => openUrl(VULTISIG_SHARE_APP_LINK),
        },
        {
          id: 'check-for-update',
          title: t('vault_settings_check_for_update'),
          icon: <DownloadIcon stroke="white" />,
          onClick: () => navigate('checkUpdate'),
        },
      ],
    },
    {
      sectionTitle: t('vault_settings_section_legal'),
      items: [
        {
          id: 'privacy-policy',
          title: t('vault_settings_privacy_policy'),
          icon: <ShieldCheckIcon />,
          onClick: () => openUrl(VULTISIG_PRIVACY_POLICY_LINK),
        },
        {
          id: 'terms-of-service',
          title: t('vault_settings_terms_of_service'),
          icon: <NoteIcon />,
          onClick: () => openUrl(VULTISIG_TERMS_OF_SERVICE_LINK),
        },
      ],
    },
  ]

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
            {sections.map(({ sectionTitle, items }, index) => (
              <StyledVStack key={index} gap={12}>
                {sectionTitle && (
                  <Text weight={500} color="contrast">
                    {sectionTitle}
                  </Text>
                )}
                {items.map(({ id, title, icon, onClick }) => (
                  <UnstyledButton key={id} onClick={onClick}>
                    <ListItemPanel
                      isSpecialItem={id === 'register-for-airdrop'}
                    >
                      <StyledListItemContentWrapper
                        fullWidth
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <HStack gap={12}>
                          <IconWrapper>{icon}</IconWrapper>
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
