import { StrictMode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Form, Radio } from "antd";
import ReactDOM from "react-dom/client";

import {
  getStoredLanguage,
  getStoredRequest,
  getStoredVaults,
  setStoredVaults,
} from "../../utils/storage";
import { VaultProps } from "../../utils/interfaces";
import i18n from "../../i18n/config";
import messageKeys from "../../utils/message-keys";

import { ChainKey } from "../../utils/constants";
import { Vultisig } from "../../icons";
import ConfigProvider from "../../components/config-provider";
import VultiLoading from "../../components/vulti-loading";
import VultiError from "../../components/vulti-error";

import "../../styles/index.scss";
import "../../pages/vaults/index.scss";

interface FormProps {
  uid: string;
}

interface InitialState {
  chain?: ChainKey;
  errorDescription?: string;
  errorTitle?: string;
  hasError?: boolean;
  sender?: string;
  vaults: VaultProps[];
}

const Component = () => {
  const { t } = useTranslation();
  const initialState: InitialState = { vaults: [] };
  const [state, setState] = useState(initialState);
  const { errorDescription, errorTitle, hasError, sender, vaults } = state;
  const [form] = Form.useForm();

  const handleClose = () => {
    window.close();
  };

  const handleSubmit = () => {
    form.validateFields().then(({ uid }: FormProps) => {
      if (sender) {
        getStoredVaults().then((vaults) => {
          setStoredVaults(
            vaults.map((vault) => ({
              ...vault,
              apps:
                uid === vault.uid
                  ? [
                      sender,
                      ...(vault.apps?.filter((app) => app !== sender) ?? []),
                    ]
                  : vault.apps,
              active: uid === vault.uid,
            })),
          ).then(() => {
            handleClose();
          });
        });
      }
    });
  };

  const componentDidMount = (): void => {
    getStoredLanguage().then((language) => {
      i18n.changeLanguage(language);

      getStoredRequest()
        .then(({ sender }) => {
          getStoredVaults().then((vaults) => {
            if (vaults.length) {
              setState((prevState) => ({
                ...prevState,
                sender,
                vaults,
                hasError: false,
              }));
            } else {
              setState((prevState) => ({
                ...prevState,
                errorDescription: t(messageKeys.GET_VAULT_FAILED_DESCRIPTION),
                errorTitle: t(messageKeys.GET_VAULT_FAILED),
                hasError: true,
              }));
            }
          });
        })
        .catch(() => {
          setState((prevState) => ({
            ...prevState,
            errorDescription: t(messageKeys.GET_VAULT_FAILED_DESCRIPTION),
            errorTitle: t(messageKeys.GET_VAULT_FAILED),
            hasError: true,
          }));
        });
    });
  };

  useEffect(componentDidMount, []);

  return (
    <ConfigProvider>
      <div className="layout">
        {hasError ? (
          <VultiError
            onClose={handleClose}
            description={errorDescription ?? ""}
            title={errorTitle ?? ""}
          />
        ) : vaults.length ? (
          <>
            <div className="header">
              <Vultisig className="logo" />
              <span className="title">
                {t(messageKeys.CONNECT_WITH_VULTISIG)}
              </span>
            </div>
            <div className="content">
              <Form form={form} onFinish={handleSubmit}>
                <Form.Item<FormProps>
                  name="uid"
                  rules={[
                    { required: true, message: t(messageKeys.SELECT_A_VAULT) },
                  ]}
                >
                  <Radio.Group>
                    {vaults.map(({ name, uid }) => (
                      <Radio key={uid} value={uid}>
                        <span className="name">{name}</span>
                      </Radio>
                    ))}
                  </Radio.Group>
                </Form.Item>
                <Button htmlType="submit" />
              </Form>
            </div>
            <div className="footer">
              <Button onClick={handleClose} shape="round" block>
                {t(messageKeys.CANCEL)}
              </Button>
              <Button onClick={handleSubmit} type="primary" shape="round" block>
                {t(messageKeys.CONNECT)}
              </Button>
            </div>
          </>
        ) : (
          <VultiLoading />
        )}
      </div>
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Component />
  </StrictMode>,
);
