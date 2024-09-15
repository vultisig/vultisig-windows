import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { storage } from '../../../wailsjs/go/models';
import { GetVault } from '../../../wailsjs/go/storage/Store';
import DiscoveryServiceScreen from '../../components/keygen/DiscoveryService';
import JoinKeysign from '../../components/keysign/JoinKeysign';
import KeysignDone from '../../components/keysign/KeysignDone';
import KeysignError from '../../components/keysign/KeysignError';
import KeysignView from '../../components/keysign/KeysignView';
import NavBar from '../../components/navbar/NavBar';
import { KeysignPayloadUtils } from '../../extensions/KeysignPayload';
import {
  KeysignMessage,
  KeysignPayload,
} from '../../gen/vultisig/keysign/v1/keysign_message_pb';
import { useWalletCore } from '../../providers/WalletCoreProvider';
import { Endpoint } from '../../services/Endpoint';
import { joinSession } from '../../services/Keygen/Keygen';

const JoinKeysignFlow: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [currentScreen, setCurrentScreen] = useState<number>(0);
  const [localPartyID, setLocalPartyID] = useState<string>('');
  const serverURL = useRef<string>('');
  const serviceName = useRef<string>('');
  const hexEncryptionKey = useRef<string>('');
  const currentVault = useRef<storage.Vault>(undefined as any);
  const { publicKeyECDSA, sessionID } = useParams<{
    publicKeyECDSA: string;
    sessionID: string;
  }>();
  const [keysignErr, setKeysignErr] = useState<string>('');
  const walletCore = useWalletCore();
  const [messagesToSign, setMessagesToSign] = useState<string[]>([]);
  const [keysignPayload, setKeysignPayload] = useState<KeysignPayload>();
  const navigate = useNavigate();

  useEffect(() => {
    const processJoinKeysign = async () => {
      if (publicKeyECDSA === undefined) {
        throw new Error('publicKeyECDSA is undefined');
      }
      if (sessionID === undefined) {
        throw new Error('sessionID is undefined');
      }
      const keysignMessage = queryClient.getQueryData<KeysignMessage>([
        'keysignMessage',
        sessionID,
      ]);
      if (keysignMessage === undefined) {
        throw new Error('keysignMessage is undefined');
      }
      serviceName.current = keysignMessage.serviceName;
      hexEncryptionKey.current = keysignMessage.encryptionKeyHex;

      try {
        const vault = await GetVault(publicKeyECDSA);
        setLocalPartyID(vault.local_party_id);
        // get current vault
        currentVault.current = vault;
      } catch (err) {
        console.log(err);
        setKeysignErr(t('wrong_vault_try_again'));
      }
      setKeysignPayload(keysignMessage.keysignPayload);
      console.log(keysignMessage);
      KeysignPayloadUtils.getPreKeysignImages(
        walletCore!,
        keysignMessage.keysignPayload!
      ).then(msgs => {
        setMessagesToSign(msgs);
        if (keysignMessage.useVultisigRelay) {
          serverURL.current = Endpoint.VULTISIG_RELAY;
          joinKeysign(currentVault.current.local_party_id);
          setCurrentScreen(2); // go to keysign
        } else {
          setCurrentScreen(1); // discovery service
        }
      });
    };
    processJoinKeysign();
  }, [publicKeyECDSA, queryClient]);

  const joinKeysign = async (partyID: string) => {
    console.log('joining keysign:', partyID);
    await joinSession(serverURL.current, sessionID!, partyID).then(() => {
      setCurrentScreen(2);
    });
  };

  const onKeysignDone = () => {
    setCurrentScreen(4);
  };

  const onKeysignError = (err: string) => {
    setKeysignErr(err);
    setCurrentScreen(3);
  };
  const screens = [
    {
      title: t('keysign'),
      content: <JoinKeysign />,
    },
    {
      title: t('setup'),
      content: (
        <DiscoveryServiceScreen
          onContinue={() => {
            joinKeysign(localPartyID);
          }}
          localPartyID={localPartyID}
          serviceName={serviceName.current}
        />
      ),
    },
    {
      title: t('keysign'),
      content: (
        <KeysignView
          vault={currentVault.current}
          sessionID={sessionID!}
          keysignCommittee={[]}
          hexEncryptionKey={hexEncryptionKey.current}
          messagesToSign={messagesToSign}
          keysignPayload={keysignPayload!}
          serverURL={serverURL.current}
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
      {screens[currentScreen].title && (
        <NavBar title={screens[currentScreen].title} questionLink={undefined} />
      )}
      {screens[currentScreen].content}
    </>
  );
};
export default JoinKeysignFlow;
