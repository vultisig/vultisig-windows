import crypto from 'crypto';
import Lottie from 'lottie-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import loadingAnimation from '../../../public/assets/images/loadingAnimation.json';
import { AdvertiseMediator } from '../../../wailsjs/go/mediator/Server';
import { storage } from '../../../wailsjs/go/models';
import { KeysignPayload } from '../../gen/vultisig/keysign/v1/keysign_message_pb';
import { checkForDevices, postSession } from '../../services/Keygen/Keygen';
import { createKeysignMessage } from '../../utils/QRGen';
import {
  KeygenServerType,
  keygenServerUrl,
} from '../../vault/keygen/KeygenServerType';
import { generateServiceName } from '../../vault/keygen/utils/generateServiceName';
import SelectDevice from '../selectDevice/SelectDevice';
import KeysignQRCode from './KeysignQrCode';

interface KeysignPeerDiscoveryProps {
  vault: storage.Vault;
  keysignPayload: KeysignPayload;
  onContinue: (
    serverType: KeygenServerType,
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
    console.log('keysign peer discovery');
    setDevices([]);
    setSelectedDevices([]);
    setSessionID(uuidv4());
    setServiceName(generateServiceName());
  }, []);
  useEffect(() => {
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
    console.log('setup qr code');
    createQR();
  }, [isRelay, keysignPayload, serviceName, sessionID]);

  const discoverService = useCallback(
    async (name: string) => {
      if (!isRelay) await AdvertiseMediator(name);
      await postSession(
        keygenServerUrl[isRelay ? 'relay' : 'local'],
        sessionID!,
        serviceName!
      );
      checkForDevices(
        keygenServerUrl[isRelay ? 'relay' : 'local'],
        sessionID!,
        setDevices
      );
    },
    [isRelay, serviceName, sessionID]
  );

  useEffect(() => {
    if (sessionID && serviceName) {
      discoverService(serviceName).catch(console.error);
    }
  }, [discoverService, serviceName, sessionID]);

  const handleDisabled = () => {
    if (vault.signers == undefined || vault.signers.length == 0) return true;
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
              isRelay ? 'relay' : 'local',
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
