import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getStoredLanguage, setStoredLanguage } from "../../../../utils/storage";
import { Language, languageName } from "../../../../utils/constants";
import useGoBack from "../../../../hooks/go-back";
import messageKeys from "../../../../utils/message-keys";
import routeKeys from "../../../../utils/route-keys";

import { ArrowLeft } from "../../../../icons";

interface InitialState {
  language: Language;
}

const Component = () => {
  const { t } = useTranslation();
  const initialState: InitialState = { language: Language.ENGLISH };
  const [state, setState] = useState(initialState);
  const { language } = state;
  const goBack = useGoBack();

  const changeLanguage = (language: Language) => {
    setStoredLanguage(language).then(() => {
      setState((prevState) => ({ ...prevState, language }));

      goBack(routeKeys.settings.root);
    });
  };

  const componentDidMount = (): void => {
    getStoredLanguage().then((language) => {
      setState((prevState) => ({ ...prevState, language }));
    });
  };

  useEffect(componentDidMount, []);

  const data = [
    {
      key: Language.ENGLISH,
      title: languageName[Language.ENGLISH],
    },
    {
      key: Language.GERMAN,
      title: languageName[Language.GERMAN],
    },
    {
      key: Language.SPANISH,
      title: languageName[Language.SPANISH],
    },
    {
      key: Language.ITALIAN,
      title: languageName[Language.ITALIAN],
    },
    {
      key: Language.CROATIA,
      title: languageName[Language.CROATIA],
    },
    {
      key: Language.RUSSIAN,
      title: languageName[Language.RUSSIAN],
    },
    {
      key: Language.DUTCH,
      title: languageName[Language.DUTCH],
    },
    {
      key: Language.PORTUGUESE,
      title: languageName[Language.PORTUGUESE],
    },
  ];

  return (
    <div className="layout language-page">
      <div className="header">
        <span className="heading">{t(messageKeys.LANGUAGE)}</span>
        <ArrowLeft
          className="icon icon-left"
          onClick={() => goBack(routeKeys.settings.root)}
        />
      </div>
      <div className="content">
        <div className="list list-action">
          {data.map(({ key, title }) => (
            <div
              key={key}
              className={`list-item${key === language ? " active" : ""}`}
              onClick={() => changeLanguage(key)}
            >
              {title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Component;
