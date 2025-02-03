import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "antd";

import messageKeys from "utils/message-keys";
import routeKeys from "utils/route-keys";

const Component = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="layout landing-page">
      <div className="content">
        <img src="/images/landing.png" alt="logo" className="logo" />
        <span className="title">{t(messageKeys.VULTISIG_CONNECT)}</span>
        <span className="desc">{t(messageKeys.VULTISIG_SLOGAN)}</span>
      </div>
      <div className="footer">
        <Button
          onClick={() => navigate(routeKeys.import, { replace: true })}
          type="primary"
          shape="round"
          block
        >
          {t(messageKeys.START)}
        </Button>
      </div>
    </div>
  );
};

export default Component;
