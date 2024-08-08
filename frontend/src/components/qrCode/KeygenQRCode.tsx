import React from 'react';
import QRCode from 'react-qr-code';
interface KeygenQRCode {
  data: string;
  serviceName: string;
}
const KeygenQRCode: React.FC<KeygenQRCode> = ({ data }) => {
  return (
    <>
      <div className="h-auto mx-auto max-w-xs w-full p-5 bg-btn-primary mt-2 border border-4 rounded-xl border-tertiary border-dashed">
        <div className="bg-white p-2">
          <QRCode
            size={256}
            className="h-auto max-w-full w-full"
            value={`vultisig://vultisig.com?type=NewVault&tssType=Keygen&jsonData=${data}`}
            viewBox="0 0 256 256"
          />
        </div>
      </div>
    </>
  );
};

export default KeygenQRCode;
