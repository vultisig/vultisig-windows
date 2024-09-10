import { ElementType } from 'react';
import SettingsIcon from '../../lib/ui/icons/SettingsIcon';
import GlobeIcon from '../../lib/ui/icons/GlobeIcon';
import CurrencyCircleIcon from '../../lib/ui/icons/CurrencyCircleIcon';
import AddressBookIcon from '../../lib/ui/icons/AddressBookIcon';
import FaqIcon from '../../lib/ui/icons/FaqIcon';
import DefaultChainsIcon from '../../lib/ui/icons/DefaultChainsIcon';
import ShareIcon from '../../lib/ui/icons/ShareIcon';
import ShieldCheckIcon from '../../lib/ui/icons/ShieldCheckIcon';
import NoteIcon from '../../lib/ui/icons/NoteIcon';

type SettingItem = {
  id: string;
  titleKey: string;
  icon: ElementType;
  path: string;
};

type SettingSection = {
  items: SettingItem[];
  sectionTitleKey?: string;
};

export const settingsItems: SettingSection[] = [
  {
    items: [
      {
        id: 'vault-settings',
        titleKey: 'vault_settings_settings',
        icon: SettingsIcon,
        path: 'navigateToVaultSettings',
      },
      {
        id: 'language',
        titleKey: 'vault_settings_language',
        icon: GlobeIcon,
        path: 'navigateToLanguageSettings',
      },
      {
        id: 'currency',
        titleKey: 'vault_settings_currency',
        icon: CurrencyCircleIcon,
        path: 'navigateToCurrencySettings',
      },
      {
        id: 'address-book',
        titleKey: 'vault_settings_address_book',
        icon: AddressBookIcon,
        path: 'navigateToAddressBook',
      },
      {
        id: 'default-chains',
        titleKey: 'vault_settings_default_chains',
        icon: DefaultChainsIcon,
        path: 'navigateToDefaultChains',
      },
      {
        id: 'faq',
        titleKey: 'vault_settings_faq',
        icon: FaqIcon,
        path: 'navigateToFaq',
      },
    ],
  },
  {
    sectionTitleKey: 'vault_settings_section_other',
    items: [
      {
        id: 'share-app',
        titleKey: 'vault_settings_share_app',
        icon: ShareIcon,
        path: 'navigateToShareApp',
      },
    ],
  },
  {
    sectionTitleKey: 'vault_settings_section_legal',
    items: [
      {
        id: 'privacy-policy',
        titleKey: 'vault_settings_privacy_policy',
        icon: ShieldCheckIcon,
        path: 'navigateToPrivacyPolicy',
      },
      {
        id: 'terms-of-service',
        titleKey: 'vault_settings_terms_of_service',
        icon: NoteIcon,
        path: 'navigateToTermsOfService',
      },
    ],
  },
];
