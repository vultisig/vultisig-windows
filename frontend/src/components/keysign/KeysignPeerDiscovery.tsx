import { useTranslation } from 'react-i18next';
import { storage } from '../../../wailsjs/go/models';
import { KeysignPayload } from '../../gen/vultisig/keysign/v1/keysign_message_pb';
import { useEffect, useRef, useState } from 'react';
import crypto from 'crypto';
import { generateRandomNumber } from '../../utils/util';
import { v4 as uuidv4 } from 'uuid';
import KeysignQRCode from './KeysignQrCode';
import { createKeysignMessage } from '../../utils/QRGen';
import Lottie from 'lottie-react';
import SelectDevice from '../selectDevice/SelectDevice';
import loadingAnimation from '../../../public/assets/images/loadingAnimation.json';
import { AdvertiseMediator } from '../../../wailsjs/go/mediator/Server';
import { checkForDevices, postSession } from '../../services/Keygen/Keygen';

interface KeysignPeerDiscoveryProps {
  vault: storage.Vault;
  keysignPayload: KeysignPayload;
  onContinue: (
    isRelay: boolean,
    sessionID: string,
    devices: string[],
    hexEncryptionKey: string
  ) => void;
}
function getHexEncodedRandomBytes(length: number): string {
  const bytes = crypto.randomBytes(length);
  return bytes.toString('hex');
}

const KeysignPeerDiscovery: React.FC<KeysignPeerDiscoveryProps> = ({
  vault,
  keysignPayload,
  onContinue,
}) => {
  const { t } = useTranslation();
  const [qrData, setQrData] = useState('');
  const [serviceName, setServiceName] = useState<string>();
  const [devices, setDevices] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [sessionID, setSessionID] = useState<string>();
  const [isRelay, setIsRelay] = useState(true);
  const hexEncryptionKey = useRef(getHexEncodedRandomBytes(32));

  useEffect(() => {
    setDevices([]);
    setSelectedDevices([]);
    setSessionID(uuidv4());
    setServiceName(`Vultisig-Windows-${generateRandomNumber()}`);
    async function createQR() {
      setQrData(
        await createKeysignMessage(
          isRelay,
          serviceName!,
          sessionID!,
          hexEncryptionKey.current,
          keysignPayload
        )
      );
    }
    createQR();
  }, [isRelay, sessionID, serviceName, hexEncryptionKey]);
  useEffect(() => {
    if (sessionID && serviceName) {
      discoverService(serviceName).catch(console.error);
    }
  }, [isRelay, sessionID, serviceName]);

  const discoverService = async (name: string) => {
    if (!isRelay) await AdvertiseMediator(name);
    await postSession(isRelay, sessionID!, serviceName!);
    checkForDevices(isRelay, sessionID!, setDevices);
  };
  const handleDisabled = () => {
    const minDevices = (vault.signers.length * 2) / 3;
    return selectedDevices.length + 1 < minDevices;
  };

  return (
    <>
      <div className="mx-auto w-full mt-5 text-white text-center">
        <div>
          <KeysignQRCode
            data={qrData}
            publicKeyECDSA={vault.public_key_ecdsa}
          />
        </div>
        <div className="flex gap-10 justify-center mt-5">
          <button
            onClick={() => setIsRelay(true)}
            className={`${
              isRelay ? 'bg-switchBtn-secondary' : 'bg-switchBtn-primary'
            } rounded-3xl flex items-center justify-center w-[150px] py-2 gap-2`}
          >
            <img src="/assets/icons/cellular.svg" alt="cellular" />{' '}
            {t('internet')}
          </button>
          <button
            onClick={() => setIsRelay(false)}
            className={`${
              !isRelay ? 'bg-switchBtn-secondary' : 'bg-switchBtn-primary'
            } rounded-3xl flex items-center justify-center w-[150px] py-2 gap-2`}
          >
            <img src="/assets/icons/wifi.svg" alt="wifi" /> {t('local')}
          </button>
        </div>
        {devices.length == 0 ? (
          <>
            <h3 className="mt-5 font-semibold">{t('looking_for_devices')}</h3>
            <div className="w-28 h-auto mx-auto my-5">
              <Lottie animationData={loadingAnimation} loop={true} />
            </div>
          </>
        ) : (
          <SelectDevice
            devices={devices}
            selectedDevices={selectedDevices}
            setSelectedDevices={setSelectedDevices}
          />
        )}

        {isRelay ? (
          <div>
            <img
              src="/assets/icons/cellular.svg"
              alt="cellular"
              className="mx-auto my-2"
            />
            {t('devices_on_same_internet')}
          </div>
        ) : (
          <div>
            <img
              src="/assets/icons/wifi.svg"
              alt="wifi"
              className="mx-auto my-2"
            />
            {t('devices_on_same_wifi')}
          </div>
        )}
        <button
          disabled={handleDisabled()}
          onClick={() => {
            onContinue(
              isRelay,
              sessionID!,
              selectedDevices,
              hexEncryptionKey.current
            );
          }}
          className="w-[400px] disabled:opacity-30  bg-switchBtn-primary rounded-3xl mt-10 py-2 font-bold"
        >
          {t('continue')}
        </button>
      </div>
    </>
  );
};

export default KeysignPeerDiscovery;
