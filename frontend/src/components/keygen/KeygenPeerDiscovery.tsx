import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import KeygenQRCode from '../qrCode/KeygenQRCode';
import Lottie from 'lottie-react';
import loadingAnimation from '../../../public/assets/images/loadingAnimation.json';
import SelectDevice from '../selectDevice/SelectDevice';
import { createKeygenMsg } from '../../utils/QRGen';
import { v4 as uuidv4 } from 'uuid';
import { generateRandomNumber } from '../../utils/util';
import { AdvertiseMediator } from '../../../wailsjs/go/relay/Server';
import {
  checkForDevices,
  clearCheckingInterval,
  postSession,
} from '../../services/Keygen/Keygen';

interface KeygenPeerDiscoveryProps {
  vaultType: string;
  vaultName: string;
  keygenStart: (
    isRelay: boolean,
    sessionID: string,
    serviceName: string,
    devices: string[]
  ) => void;
}
const KeygenPeerDiscovery: React.FC<KeygenPeerDiscoveryProps> = ({
  vaultType,
  vaultName,
  keygenStart,
}) => {
  const { t } = useTranslation();
  const [qrData, setQrData] = useState('');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [serviceName, setServiceName] = useState<string>();
  const [devices, setDevices] = useState<string[]>([]);
  const [sessionID, setSessionID] = useState<string>();
  const [isRelay, setIsRelay] = useState(true);

  useEffect(() => {
    setSessionID(uuidv4());
    setServiceName(`VultisigWindows-${generateRandomNumber()}`);
    return () => {
      clearCheckingInterval();
    };
  }, []);

  useEffect(() => {
    setDevices([]);
    setSelectedDevices([]);
    async function createQR() {
      setQrData(
        await createKeygenMsg(isRelay, vaultName, serviceName!, sessionID!)
      );
    }
    clearCheckingInterval();
    createQR();
  }, [isRelay, sessionID, serviceName]);

  useEffect(() => {
    if (sessionID && serviceName) {
      discoverService(serviceName);
    }
  }, [isRelay, sessionID, serviceName]);

  const discoverService = async (name: string) => {
    if (!isRelay) await AdvertiseMediator(name);
    await postSession(isRelay, sessionID!, serviceName!);
    checkForDevices(isRelay, sessionID!, setDevices);
  };

  const handleDisabled = () => {
    const minDevices = vaultType.split('/')[1];
    switch (minDevices) {
      case 'n':
        return selectedDevices.length < 1;
      case '3':
        return selectedDevices.length != 2;
      case '2':
        return selectedDevices.length != 1;
    }
  };

  return (
    <>
      <div className="mx-auto w-full mt-5 text-white text-center">
        <div>
          <KeygenQRCode data={qrData} serviceName={serviceName!} />
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
            keygenStart(isRelay, sessionID!, serviceName!, selectedDevices);
          }}
          className="w-[400px] disabled:opacity-30  bg-switchBtn-primary rounded-3xl mt-10 py-2 font-bold"
        >
          {t('continue')}
        </button>
      </div>
    </>
  );
};

export default KeygenPeerDiscovery;
