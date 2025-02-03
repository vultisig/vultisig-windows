import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { getStoredVaults, setStoredVaults } from "utils/storage";
import type { VaultProps } from "utils/interfaces";
import useGoBack from "hooks/go-back";
import messageKeys from "utils/message-keys";
import routeKeys from "utils/route-keys";

import { ArrowLeft, ArrowRight } from "icons";
import { Button } from "antd";

interface InitialState {
  vault?: VaultProps;
  vaults: VaultProps[];
}

const Component = () => {
  const { t } = useTranslation();
  const initialState: InitialState = { vaults: [] };
  const [state, setState] = useState(initialState);
  const { vault, vaults } = state;
  const navigate = useNavigate();
  const goBack = useGoBack();

  const handleSelect = (uid: string) => {
    setStoredVaults(
      vaults.map((vault) => ({ ...vault, active: vault.uid === uid }))
    ).then(() => {
      goBack(routeKeys.main);
    });
  };

  const componentDidMount = (): void => {
    getStoredVaults().then((vaults) => {
      const vault = vaults.find(({ active }) => active);

      setState((prevState) => ({ ...prevState, vault, vaults }));
    });
  };

  useEffect(componentDidMount, []);

  return vault ? (
    <div className="layout vaults-page">
      <div className="header">
        <span className="heading">{t(messageKeys.CHOOSE_VAULT)}</span>
        <ArrowLeft
          className="icon icon-left"
          onClick={() => goBack(routeKeys.main)}
        />
      </div>
      <div className="content">
        <div className="list">
          <div className="list-item">
            <span className="label">{vault?.name}</span>
            <span className="extra">
              <span className="text">{t(messageKeys.ACTIVE)}</span>
            </span>
          </div>
        </div>
        {vaults.length > 1 && (
          <>
            <span className="divider">{t(messageKeys.OTHER_VAULTS)}</span>
            <div className="list list-arrow list-action">
              {vaults
                .filter(({ uid }) => uid !== vault.uid)
                .map(({ name, uid }) => (
                  <div
                    key={uid}
                    onClick={() => handleSelect(uid)}
                    className="list-item"
                  >
                    <span className="label">{name}</span>
                    <ArrowRight className="action" />
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
      <div className="footer">
        <Button
          onClick={() => navigate(routeKeys.import, { state: true })}
          shape="round"
          block
        >
          {t(messageKeys.ADD_NEW_VAULT)}
        </Button>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default Component;
