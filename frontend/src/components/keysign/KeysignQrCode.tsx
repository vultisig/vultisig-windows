import React from 'react';
import QRCode from 'react-qr-code';
interface KeysignQRCodeProps {
  data: string;
  publicKeyECDSA: string;
}
const KeysignQRCode: React.FC<KeysignQRCodeProps> = ({
  publicKeyECDSA,
  data,
}) => {
  return (
    <>
      <div className="h-auto mx-auto max-w-64 w-full p-5 bg-btn-primary mt-2 border border-4 rounded-xl border-secondary border-dashed ">
        <div className="bg-white p-2 rounded-xl">
          <QRCode
            size={256}
            className="h-auto max-w-full w-full"
            value={`vultisig://vultisig.com?type=SignTransaction&vault=${publicKeyECDSA}&jsonData=${data}`}
            viewBox="0 0 256 256"
          />
        </div>
      </div>
    </>
  );
};

export default KeysignQRCode;
