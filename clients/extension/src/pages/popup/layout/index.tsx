import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { getStoredVaults } from "utils/storage";
import routerKeys from "utils/route-keys";

interface InitialState {
  loaded: boolean;
}

const Component = () => {
  const initialState: InitialState = { loaded: false };
  const [state, setState] = useState(initialState);
  const { loaded } = state;
  const navigate = useNavigate();

  const componentDidMount = (): void => {
    getStoredVaults().then((vaults) => {
      if (vaults.length) {
        setState((prevState) => ({ ...prevState, loaded: true }));
      } else {
        navigate(routerKeys.landing, { replace: true });
      }
    });
  };

  useEffect(componentDidMount, []);

  return loaded ? <Outlet /> : <></>;
};

export default Component;
