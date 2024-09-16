import {
  LANGUAGES,
  LanguageValue,
} from '../../../lib/hooks/useInAppLanguage/constants';

type LanguageOption = {
  value: LanguageValue;
  title: string;
  subtitle: string;
};

export const languageOptions: LanguageOption[] = [
  {
    value: LANGUAGES.English,
    title: 'vault_settings_language_settings_title_english',
    subtitle: 'vault_settings_language_settings_subtitle_english',
  },
  {
    value: LANGUAGES.German,
    title: 'vault_settings_language_settings_title_german',
    subtitle: 'vault_settings_language_settings_subtitle_german',
  },
  {
    value: LANGUAGES.Spanish,
    title: 'vault_settings_language_settings_title_spanish',
    subtitle: 'vault_settings_language_settings_subtitle_spanish',
  },
  {
    value: LANGUAGES.Italian,
    title: 'vault_settings_language_settings_title_italian',
    subtitle: 'vault_settings_language_settings_subtitle_italian',
  },
  {
    value: LANGUAGES.Croatian,
    title: 'vault_settings_language_settings_title_croatian',
    subtitle: 'vault_settings_language_settings_subtitle_croatian',
  },
  {
    value: LANGUAGES.Portuguese,
    title: 'vault_settings_language_settings_title_portugal',
    subtitle: 'vault_settings_language_settings_subtitle_portugal',
  },
];
