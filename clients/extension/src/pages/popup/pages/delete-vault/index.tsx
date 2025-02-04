import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, ConfigProvider } from "antd";

import { getStoredVaults, setStoredVaults } from "../../../../utils/storage";
import type { VaultProps } from "../../../../utils/interfaces";
import useGoBack from "../../../../hooks/go-back";
import messageKeys from "../../../../utils/message-keys";
import routeKeys from "../../../../utils/route-keys";

import { ArrowLeft, TriangleWarning } from "../../../../icons";

interface InitialState {
  vault?: VaultProps;
}

const Component = () => {
  const { t } = useTranslation();
  const initialState: InitialState = {};
  const [state, setState] = useState(initialState);
  const { vault } = state;
  const navigate = useNavigate();
  const goBack = useGoBack();

  const handleSubmit = (): void => {
    getStoredVaults().then((vaults) => {
      const modifiedVaults = vaults.filter(({ active }) => !active);

      if (modifiedVaults.length) {
        setStoredVaults(
          modifiedVaults.map((vault, index) =>
            index === 0 ? { ...vault, active: true } : vault
          )
        );

        navigate(routeKeys.main, { replace: true });
      } else {
        setStoredVaults([]);

        navigate(routeKeys.landing, { replace: true });
      }
    });
  };

  const componentDidMount = (): void => {
    getStoredVaults().then((vaults) => {
      const vault = vaults.find(({ active }) => active);

      setState((prevState) => ({ ...prevState, vault }));
    });
  };

  useEffect(componentDidMount, []);

  return (
    <div className="layout delete-vault-page">
      <div className="header">
        <span className="heading">{t(messageKeys.REMOVE_VAULT)}</span>
        <ArrowLeft
          className="icon icon-left"
          onClick={() => goBack(routeKeys.settings.root)}
        />
      </div>
      <div className="content">
        <TriangleWarning className="icon" />
        <span className="text">{`${t(
          messageKeys.REMOVING_VAULT_WARNING
        )}:`}</span>
        <span className="name">{vault?.name}</span>
      </div>
      <div className="footer">
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#f7961b",
            },
          }}
        >
          <Button onClick={handleSubmit} type="primary" shape="round" block>
            {t(messageKeys.REMOVE_VAULT)}
          </Button>
        </ConfigProvider>
      </div>
    </div>
  );
};

export default Component;
