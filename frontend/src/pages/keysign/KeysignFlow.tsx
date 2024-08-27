import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeysignPayload } from '../../gen/vultisig/keysign/v1/keysign_message_pb';
import { storage } from '../../../wailsjs/go/models';
import KeysignPeerDiscovery from '../../components/keysign/KeysignPeerDiscovery';
import NavBar from '../../components/navbar/NavBar';
import KeysignView from '../../components/keysign/KeysignView';
import { ENDPOINTS } from '../../utils/config';
import { KeysignPayloadUtils } from '../../extensions/KeysignPayload';
import { useLocation } from 'react-router-dom';

const KeysignFlowView: React.FC = () => {
  const { t } = useTranslation();
  const [currentScreen, setCurrentScreen] = useState<number>(0);
  const [sessionID, setSessionID] = useState<string>();
  const [devices, setDevices] = useState<string[]>([]);
  const [hexEncryptionKey, setHexEncryptionKey] = useState<string>('');
  const [serverURL, setServerURL] = useState<string>('http://localhost:18080');
  const [messagesToSign, setMessagesToSign] = useState<string[]>([]);
  const currentVault = useRef<storage.Vault>(new storage.Vault());
  const location = useLocation();
  const { vault, keysignPayload } = location.state as {
    vault: storage.Vault;
    keysignPayload: KeysignPayload;
  };

  useEffect(() => {
    console.log('testtest...');
    currentVault.current = vault;
    setCurrentScreen(0);
    console.log('testtest...111');
    console.log('current screen:title', screens[currentScreen].title);
  }, []);

  const onKeysignPeerDiscoveryContinue = (
    isRelay: boolean,
    sessionID: string,
    devices: string[],
    hexEncryptionKey: string
  ) => {
    console.log('KeysignPeerDiscoveryContinue');
    setServerURL(
      isRelay ? ENDPOINTS.VULTISIG_RELAY : ENDPOINTS.LOCAL_MEDIATOR_URL
    );
    setSessionID(sessionID);
    setDevices(devices);
    setHexEncryptionKey(hexEncryptionKey);
    KeysignPayloadUtils.getPreKeysignImages(keysignPayload).then(msgs => {
      setMessagesToSign(msgs);
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
          onDone={() => {}}
          onError={() => {}}
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
