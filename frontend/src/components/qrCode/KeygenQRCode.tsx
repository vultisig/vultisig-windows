import React, { useEffect } from "react";
import QRCode from "react-qr-code";
import styles from "./KeygenQRCode.module.css";

import { generateRandomNumber } from "../../utils/util";
interface KeygenQRCode {
  data: string;
  serviceName: string;
}
const KeygenQRCode: React.FC<KeygenQRCode> = ({ data, serviceName }) => {
  return (
    <>
      <div
        className={`h-auto mx-auto max-w-xs w-full p-5 bg-btn-primary mt-2 border border-4 rounded-xl border-tertiary border-dashed `}
      >
        <div className="bg-white p-2">
          <QRCode
            size={256}
            className="h-auto max-w-full w-full "
            value={`vultisig://vultisig.com?type=NewVault&tssType=Keygen&jsonData=${data}`}
            viewBox={`0 0 256 256`}
          />
        </div>
      </div>
    </>
  );
};

export default KeygenQRCode;
