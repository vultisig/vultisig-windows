import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button, Form, Input } from "antd";

import { VaultProps } from "utils/interfaces";
import { getStoredVaults, setStoredVaults } from "utils/storage";
import useGoBack from "hooks/go-back";
import messageKeys from "utils/message-keys";
import routeKeys from "utils/route-keys";

import { ArrowLeft } from "icons";

const Component = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const goBack = useGoBack();

  const handleSubmit = (): void => {
    form
      .validateFields()
      .then(({ name }: VaultProps) => {
        getStoredVaults().then((vaults) => {
          setStoredVaults(
            vaults.map((item) => (item.active ? { ...item, name } : item))
          );

          goBack(routeKeys.settings.vault);
        });
      })
      .catch(() => {});
  };

  const componentDidMount = (): void => {
    getStoredVaults().then((vaults) => {
      const vault = vaults.find(({ active }) => active);

      form.setFieldsValue(vault);
    });
  };

  useEffect(componentDidMount, []);

  return (
    <div className="layout rename-vault-page">
      <div className="header">
        <span className="heading">{t(messageKeys.RENAME_VAULT)}</span>
        <ArrowLeft
          className="icon icon-left"
          onClick={() => goBack(routeKeys.settings.root)}
        />
      </div>
      <div className="content">
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item<VaultProps> name="name" rules={[{ required: true }]}>
            <Input placeholder={t(messageKeys.NAME)} />
          </Form.Item>
          <Button htmlType="submit" />
        </Form>
      </div>
      <div className="footer">
        <Button onClick={handleSubmit} type="primary" shape="round" block>
          {t(messageKeys.SAVE)}
        </Button>
      </div>
    </div>
  );
};

export default Component;
