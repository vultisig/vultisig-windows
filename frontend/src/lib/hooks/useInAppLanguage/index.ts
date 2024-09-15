import {
  PersistentStateKey,
  usePersistentState,
} from '../../../state/persistentState';
import { LANGUAGES, LanguageValue } from './constants';

export const useInAppLanguage = () => {
  const [language, setLanguage] = usePersistentState(
    PersistentStateKey.Language,
    LANGUAGES.English
  );

  return {
    language,
    changeInAppLanguage: (newLanguage: LanguageValue) =>
      setLanguage(newLanguage),
  };
};
