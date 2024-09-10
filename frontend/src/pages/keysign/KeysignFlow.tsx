import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeysignPayload } from '../../gen/vultisig/keysign/v1/keysign_message_pb';
import { storage } from '../../../wailsjs/go/models';
import KeysignPeerDiscovery from '../../components/keysign/KeysignPeerDiscovery';
import NavBar from '../../components/navbar/NavBar';
import KeysignView from '../../components/keysign/KeysignView';
import { KeysignPayloadUtils } from '../../extensions/KeysignPayload';
import { useLocation, useNavigate } from 'react-router-dom';
import { startSession } from '../../services/Keygen/Keygen';
import { useWalletCore } from '../../main';
import KeysignError from '../../components/keysign/KeysignError';
import KeysignDone from '../../components/keysign/KeysignDone';
import { Endpoint } from '../../services/Endpoint';

const KeysignFlowView: React.FC = () => {
  const { t } = useTranslation();
  const [currentScreen, setCurrentScreen] = useState<number>(0);
  const [sessionID, setSessionID] = useState<string>();
  const [devices, setDevices] = useState<string[]>([]);
  const [hexEncryptionKey, setHexEncryptionKey] = useState<string>('');
  const [serverURL, setServerURL] = useState<string>('http://localhost:18080');
  const [messagesToSign, setMessagesToSign] = useState<string[]>([]);
  const [keysignErr, setKeysignErr] = useState<string>('');
  const walletCore = useWalletCore();
  const currentVault = useRef<storage.Vault>(new storage.Vault());
  const location = useLocation();
  const { vault, keysignPayload } = location.state as {
    vault: storage.Vault;
    keysignPayload: KeysignPayload;
  };
  const navigate = useNavigate();
  useEffect(() => {
    currentVault.current = vault;
    setCurrentScreen(0);
  }, []);

  const onKeysignPeerDiscoveryContinue = (
    isRelay: boolean,
    sessionID: string,
    devices: string[],
    hexEncryptionKey: string
  ) => {
    setServerURL(
      isRelay ? Endpoint.VULTISIG_RELAY : Endpoint.LOCAL_MEDIATOR_URL
    );
    setSessionID(sessionID);
    devices.push(currentVault.current.local_party_id!);
    setDevices(devices);
    setHexEncryptionKey(hexEncryptionKey);
    KeysignPayloadUtils.getPreKeysignImages(walletCore!, keysignPayload).then(
      msgs => {
        setMessagesToSign(msgs);
      }
    );
    console.log('keysign payload:', keysignPayload);
    startSession(isRelay, sessionID, devices).then(() => {
      setCurrentScreen(1);
    });
  };

  const prevScreen = () => {
    setCurrentScreen(prev => {
      if (prev > 5) {
        return 4;
      } else {
        return prev > 0 ? prev - 1 : prev;
      }
    });
  };

  const onKeysignError = (err: string) => {
    setKeysignErr(err);
    setCurrentScreen(2);
  };

  const onKeysignDone = () => {
    setCurrentScreen(3);
  };

  const screens = [
    {
      title: t('send'),
      content: (
        <KeysignPeerDiscovery
          vault={vault}
          keysignPayload={keysignPayload}
          onContinue={onKeysignPeerDiscoveryContinue}
        />
      ),
    },
    {
      title: t('keysign'),
      content: (
        <KeysignView
          vault={vault}
          sessionID={sessionID!}
          keysignCommittee={devices}
          hexEncryptionKey={hexEncryptionKey}
          messagesToSign={messagesToSign}
          keysignPayload={keysignPayload}
          serverURL={serverURL}
          onDone={onKeysignDone}
          onError={onKeysignError}
        />
      ),
    },
    {
      title: t('keysign_error'),
      content: <KeysignError keysignError={keysignErr} onTryAgain={() => {}} />,
    },
    {
      title: t('keysign_done'),
      content: (
        <KeysignDone
          onNext={() => {
            navigate('/vault/list');
          }}
        />
      ),
    },
  ];

  return (
    <>
      <div>
        {screens[currentScreen].title && (
          <NavBar
            title={screens[currentScreen].title}
            questionLink={undefined}
            handleBack={currentScreen !== 0 ? prevScreen : undefined}
          />
        )}
        {screens[currentScreen].content}
      </div>
    </>
  );
};

export default KeysignFlowView;
