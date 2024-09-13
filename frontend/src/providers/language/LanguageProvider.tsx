import { createContext, FC, PropsWithChildren, useState } from 'react';

type LanguageContextType = {
  language: string;
  changeAppLanguage: (newLanguage: string) => void;
};

const LanguageContext = createContext<LanguageContextType>(null!);

export const LanguageProvider: FC<PropsWithChildren> = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const changeAppLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, changeAppLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
