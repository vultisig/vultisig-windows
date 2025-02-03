import { StrictMode, useEffect } from "react";
import { Navigate, RouterProvider, createHashRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";

import { getStoredLanguage } from "utils/storage";
import i18n from "i18n/config";
import routerKeys from "utils/route-keys";

import ConfigProvider from "components/config-provider";
import ImportPage from "pages/popup/pages/import";

import "styles/index.scss";
import "pages/popup/index.scss";

const router = createHashRouter(
  [
    {
      path: routerKeys.root,
      element: <ImportPage />,
    },
    {
      path: "*",
      element: <Navigate to={routerKeys.root} replace />,
    },
  ],
  {
    basename: routerKeys.basePath,
  }
);

const Component = () => {
  const componentDidMount = (): void => {
    getStoredLanguage().then((language) => {
      i18n.changeLanguage(language);
    });
  };

  useEffect(componentDidMount, []);

  return (
    <ConfigProvider>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Component />
  </StrictMode>
);
