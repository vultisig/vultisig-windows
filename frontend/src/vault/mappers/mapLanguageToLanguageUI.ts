import { languageOptions } from '../../pages/vaultSettings/vaultLanguage/constants';

export const mapLanguageToLanguageNameUI = (language: string) => {
  return languageOptions.find(option => option.value === language)?.title;
};
