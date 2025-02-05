import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';

import { ChildrenProp } from '../lib/ui/props';
import { useLanguage } from '../preferences/state/language';
import i18nInstance from './config';

export const I18nProvider = ({ children }: ChildrenProp) => {
  const [language] = useLanguage();

  useEffect(() => {
    i18nInstance.changeLanguage(language);
  }, [language]);

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
};
