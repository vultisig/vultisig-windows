import { createContext, FC, PropsWithChildren, useContext } from 'react';
import {
  PersistentStateKey,
  usePersistentState,
} from '../../state/persistentState';
import { LanguageValue, LANGUAGES } from './constants';

type LanguageContextType = {
  language: string;
  changeInAppLanguage: (newLanguage: LanguageValue) => void;
};

const LanguageContext = createContext<LanguageContextType>(null!);

export const LanguageProvider: FC<PropsWithChildren> = ({ children }) => {
  const [language, setLanguage] = usePersistentState(
    PersistentStateKey.Language,
    LANGUAGES.English
  );

  const changeInAppLanguage = (newLanguage: LanguageValue) => {
    setLanguage(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, changeInAppLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useInAppLanguage = () => useContext(LanguageContext);
