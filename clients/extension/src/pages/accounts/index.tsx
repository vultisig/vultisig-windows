import { StrictMode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Checkbox, Form } from "antd";
import ReactDOM from "react-dom/client";

import { ChainKey } from "../../utils/constants";
import {
  getStoredLanguage,
  getStoredRequest,
  getStoredVaults,
  setStoredVaults,
} from "../../utils/storage";
import { VaultProps } from "../../utils/interfaces";
import i18n from "../../i18n/config";
import messageKeys from "../../utils/message-keys";

import { Vultisig } from "../../icons";
import ConfigProvider from "../../components/config-provider";
import MiddleTruncate from "../../components/middle-truncate";
import VultiError from "../../components/vulti-error";
import VultiLoading from "../../components/vulti-loading";

import "../../styles/index.scss";
import "../accounts/index.scss";

interface FormProps {
  uids: string[];
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
  const { chain, errorDescription, errorTitle, hasError, sender, vaults } =
    state;
  const [form] = Form.useForm();

  const handleClose = () => {
    window.close();
  };

  const handleSubmit = () => {
    form.validateFields().then(({ uids }: FormProps) => {
      if (sender) {
        getStoredVaults().then((vaults) => {
          setStoredVaults(
            vaults.map((vault) => ({
              ...vault,
              apps:
                uids.indexOf(vault.uid) >= 0
                  ? [
                      sender,
                      ...(vault.apps?.filter((app) => app !== sender) ?? []),
                    ]
                  : vault.apps?.filter((app) => app !== sender) ?? [],
            }))
          ).then(() => {
            handleClose();
          });
        });
      }
    });
  };

  useEffect(() => {
    getStoredLanguage().then((language) => {
      i18n.changeLanguage(language);

      getStoredRequest()
        .then(({ chain, sender }) => {
          getStoredVaults().then((vaults) => {
            if (vaults.length) {
              setState((prevState) => ({
                ...prevState,
                chain,
                sender,
                vaults,
                hasError: false,
              }));

              form.setFieldsValue({
                uids: vaults
                  .filter(({ apps }) => apps && apps.indexOf(sender) >= 0)
                  .map(({ uid }) => uid),
              });
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
        .catch(() => {});
    });
  }, []);

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
              <span className="origin">{sender}</span>
            </div>
            <div className="content">
              <Form form={form} onFinish={handleSubmit}>
                <Form.Item<FormProps>
                  name="uids"
                  rules={[
                    { required: true, message: t(messageKeys.SELECT_A_VAULT) },
                  ]}
                >
                  <Checkbox.Group>
                    {vaults.map(({ chains, name, uid }) => (
                      <Checkbox key={uid} value={uid}>
                        <span className="name">{name}</span>
                        <MiddleTruncate
                          text={
                            chains.find(({ name }) => name === chain)
                              ?.address ?? ""
                          }
                        />
                      </Checkbox>
                    ))}
                  </Checkbox.Group>
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
  </StrictMode>
);
