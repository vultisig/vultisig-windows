import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getStoredCurrency, setStoredCurrency } from "utils/storage";
import { Currency, currencyName } from "utils/constants";
import useGoBack from "hooks/go-back";
import messageKeys from "utils/message-keys";
import routeKeys from "utils/route-keys";

import { ArrowLeft } from "icons";

interface InitialState {
  currency: Currency;
}

const Component = () => {
  const { t } = useTranslation();
  const initialState: InitialState = { currency: Currency.USD };
  const [state, setState] = useState(initialState);
  const { currency } = state;
  const goBack = useGoBack();

  const changeLanguage = (currency: Currency) => {
    setStoredCurrency(currency).then(() => {
      setState((prevState) => ({ ...prevState, currency }));

      goBack(routeKeys.settings.root);
    });
  };

  const componentDidMount = (): void => {
    getStoredCurrency().then((currency) => {
      setState((prevState) => ({ ...prevState, currency }));
    });
  };

  useEffect(componentDidMount, []);

  const data = [
    {
      key: Currency.USD,
      title: currencyName[Currency.USD],
    },
    {
      key: Currency.AUD,
      title: currencyName[Currency.AUD],
    },
    {
      key: Currency.CAD,
      title: currencyName[Currency.CAD],
    },
    {
      key: Currency.SGD,
      title: currencyName[Currency.SGD],
    },
    {
      key: Currency.EUR,
      title: currencyName[Currency.EUR],
    },
    {
      key: Currency.RUB,
      title: currencyName[Currency.RUB],
    },
    {
      key: Currency.GBP,
      title: currencyName[Currency.GBP],
    },
    {
      key: Currency.JPY,
      title: currencyName[Currency.JPY],
    },
    {
      key: Currency.CNY,
      title: currencyName[Currency.CNY],
    },
    {
      key: Currency.SEK,
      title: currencyName[Currency.SEK],
    },
  ];

  return (
    <div className="layout currency-page">
      <div className="header">
        <span className="heading">{t(messageKeys.CURRENCY)}</span>
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
              className={`list-item${key === currency ? " active" : ""}`}
              onClick={() => changeLanguage(key)}
            >
              <span className="label">{title}</span>
              <span className="extra">{key}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Component;
