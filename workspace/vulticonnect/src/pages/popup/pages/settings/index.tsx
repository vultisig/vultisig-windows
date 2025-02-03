import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getStoredCurrency, getStoredLanguage } from "utils/storage";
import { Currency, Language, languageName } from "utils/constants";
import useGoBack from "hooks/go-back";
import messageKeys from "utils/message-keys";
import routeKeys from "utils/route-keys";

import {
  ArrowLeft,
  ArrowRight,
  CircleDollar,
  CircleHelp,
  SettingsOne,
  Translate,
  Vultisig,
} from "icons";

import packageJson from "../../../../../package.json";

interface InitialState {
  currency: Currency;
  language: Language;
}

const Component = () => {
  const { t } = useTranslation();
  const initialState: InitialState = {
    currency: Currency.USD,
    language: Language.ENGLISH,
  };
  const [state, setState] = useState(initialState);
  const { currency, language } = state;
  const goBack = useGoBack();

  const componentDidMount = (): void => {
    getStoredCurrency().then((currency) => {
      setState((prevState) => ({ ...prevState, currency }));
    });

    getStoredLanguage().then((language) => {
      setState((prevState) => ({ ...prevState, language }));
    });
  };

  useEffect(componentDidMount, []);

  return (
    <div className="layout settings-page">
      <div className="header">
        <span className="heading">{t(messageKeys.SETTINGS)}</span>
        <ArrowLeft
          className="icon icon-left"
          onClick={() => goBack(routeKeys.main)}
        />
      </div>
      <div className="content">
        <div className="list list-arrow list-action list-icon">
          <Link
            to={routeKeys.settings.vault}
            state={true}
            className="list-item"
          >
            <SettingsOne className="icon" />
            <span className="label">{t(messageKeys.VAULT_SETTINGS)}</span>
            <ArrowRight className="action" />
          </Link>
          <Link
            to={routeKeys.settings.language}
            state={true}
            className="list-item"
          >
            <Translate className="icon" />
            <span className="label">{t(messageKeys.LANGUAGE)}</span>
            <span className="extra">{languageName[language]}</span>
            <ArrowRight className="action" />
          </Link>
          <Link
            to={routeKeys.settings.currency}
            state={true}
            className="list-item"
          >
            <CircleDollar className="icon" />
            <span className="label">{t(messageKeys.CURRENCY)}</span>
            <span className="extra">{currency}</span>
            <ArrowRight className="action" />
          </Link>
          <a
            href="https://vultisig.com/faq"
            rel="noopener noreferrer"
            target="_blank"
            className="list-item"
          >
            <CircleHelp className="icon" />
            <span className="label">{t(messageKeys.FAQ)}</span>
            <ArrowRight className="action" />
          </a>
        </div>
        <span className="divider">{t(messageKeys.OTHER)}</span>
        <div className="list list-action list-icon">
          <a
            href="https://vultisig.com/vult"
            rel="noopener noreferrer"
            target="_blank"
            className="list-item"
          >
            <Vultisig className="icon" />
            <span className="label">{t(messageKeys.VULT_TOKEN)}</span>
          </a>
        </div>
      </div>
      <div className="footer">
        <a
          target="_blank"
          href="https://chromewebstore.google.com/detail/vulticonnect/ggafhcdaplkhmmnlbfjpnnkepdfjaelb"
          className="version"
        >
          VULTICONNECT V{packageJson.version}
        </a>
      </div>
    </div>
  );
};

export default Component;
