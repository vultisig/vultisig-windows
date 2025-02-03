import { StrictMode, useEffect } from "react";
import ReactDOM from "react-dom/client";

import { getStoredLanguage } from "utils/storage";
import i18n from "i18n/config";

import ConfigProvider from "components/config-provider";
import Routing from "pages/popup/routes";

import "styles/index.scss";
import "pages/popup/index.scss";

const Component = () => {
  const componentDidMount = (): void => {
    getStoredLanguage().then((language) => {
      i18n.changeLanguage(language);
    });
  };

  useEffect(componentDidMount, []);

  return (
    <ConfigProvider>
      <Routing />
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Component />
  </StrictMode>
);
