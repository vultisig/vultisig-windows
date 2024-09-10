import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeygenType } from '../../model/TssType';
import { useQueryClient } from '@tanstack/react-query';
import { KeygenMessage } from '../../gen/vultisig/keygen/v1/keygen_message_pb';
import { useNavigate, useParams } from 'react-router-dom';
import { Endpoint } from '../../services/Endpoint';
import KeygenError from '../../components/keygen/KeygenError';
import NavBar from '../../components/navbar/NavBar';
import { storage } from '../../../wailsjs/go/models';
import { generateRandomNumber } from '../../utils/util';
import DiscoveryServiceScreen from '../../components/keygen/DiscoveryService';
import KeygenView from '../../components/keygen/KeygenView';
import JoinKeygen from '../../components/keygen/JoinKeygen';
import { GetVault } from '../../../wailsjs/go/storage/Store';
import { ReshareMessage } from '../../gen/vultisig/keygen/v1/reshare_message_pb';
import { joinSession } from '../../services/Keygen/Keygen';
import KeygenDone from '../../components/keygen/KeygenDone';
import KeygenBackupNow from '../../components/keygen/KeygenBackupNow';
const JoinKeygenView: React.FC = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState<number>(0);
  const [keygenError, setKeygenError] = useState<string>('');
  const { keygenType, sessionID } = useParams<{
    keygenType: string;
    sessionID: string;
  }>();
  const vault = useRef<storage.Vault>(new storage.Vault());
  const hexEncryptionKey = useRef<string>('');
  const serverURL = useRef<string>('');
  const serviceName = useRef<string>('');
  const vaultAction =
    keygenType === 'Keygen' ? KeygenType.Keygen : KeygenType.Reshare;

  useEffect(() => {
    setCurrentScreen(0);
  }, []);

  useEffect(() => {
    const processJoinKeygen = async () => {
      switch (vaultAction) {
        case KeygenType.Keygen: {
          const keygenMessage = queryClient.getQueryData<KeygenMessage>([
            'keygenMessage',
          ]);
          if (keygenMessage === undefined) {
            throw new Error('keygenMessage is undefined');
          }
          hexEncryptionKey.current = keygenMessage.encryptionKeyHex;
          serviceName.current = keygenMessage.serviceName;
          vault.current.name = keygenMessage.vaultName;
          vault.current.hex_chain_code = keygenMessage.hexChainCode;
          vault.current.local_party_id = 'windows-' + generateRandomNumber();
          if (keygenMessage.useVultisigRelay) {
            serverURL.current = Endpoint.VULTISIG_RELAY;
            joinKeygen(vault.current.local_party_id);
          } else {
            setCurrentScreen(1);
          }
          break;
        }
        case KeygenType.Reshare: {
          const reshareMessage = queryClient.getQueryData<ReshareMessage>([
            'reshareMessage',
          ]);
          if (reshareMessage === undefined) {
            throw new Error('reshareMessage is undefined');
          }
          hexEncryptionKey.current = reshareMessage.encryptionKeyHex;
          serviceName.current = reshareMessage.serviceName;
          try {
            const reshareVault = await GetVault(reshareMessage.publicKeyEcdsa);
            vault.current = reshareVault;
          } catch (err) {
            console.error(err);
            vault.current.name = reshareMessage.vaultName;
            vault.current.hex_chain_code = reshareMessage.hexChainCode;
            vault.current.local_party_id = 'windows-' + generateRandomNumber();
            vault.current.reshare_prefix = reshareMessage.oldResharePrefix;
            vault.current.signers = reshareMessage.oldParties;
          }
          if (reshareMessage.useVultisigRelay) {
            serverURL.current = Endpoint.VULTISIG_RELAY;
            joinKeygen(vault.current.local_party_id);
          } else {
            setCurrentScreen(1);
          }
          break;
        }
      }
    };
    processJoinKeygen();
  }, [queryClient, vaultAction]);

  const prevScreen = () => {
    setCurrentScreen(prev => {
      if (prev > 5) {
        return 4;
      } else {
        return prev > 0 ? prev - 1 : prev;
      }
    });
  };
  const joinKeygen = async (localPartyID: string) => {
    await joinSession(serverURL.current, sessionID!, localPartyID).then(() => {
      setCurrentScreen(2);
    });
  };

  const screens = [
    {
      title: t('keygen'),
      content: <JoinKeygen />,
    },
    {
      title: t('setup'),
      content: (
        <DiscoveryServiceScreen
          onContinue={() => {
            joinKeygen(vault.current.local_party_id);
          }}
          localPartyID={vault.current.local_party_id}
          serviceName={serviceName.current}
        />
      ),
    },
    {
      title: `${t('keygen')}`,
      content: (
        <KeygenView
          vault={vault.current}
          sessionID={sessionID!}
          hexEncryptionKey={hexEncryptionKey.current}
          keygenType={vaultAction}
          serverURL={serverURL.current}
          onDone={() => {
            setCurrentScreen(3);
          }}
          onError={(err: string) => {
            setKeygenError(err);
            setCurrentScreen(4);
          }}
        />
      ),
    },
    {
      title: `${t('join')} ${t('keygen')}`,
      content: (
        <KeygenDone
          onNext={() => {
            setCurrentScreen(5);
          }}
        />
      ),
    },
    {
      title: t('keygen'),
      content: (
        <KeygenError
          keygenError={keygenError}
          onTryAgain={() => {
            navigate('/vault/list');
          }}
        />
      ),
    },
    {
      // 5
      title: '',
      content: <KeygenBackupNow />,
    },
  ];
  return (
    <>
      {screens[currentScreen].title && (
        <NavBar
          title={screens[currentScreen].title}
          questionLink={undefined}
          handleBack={currentScreen !== 0 ? prevScreen : undefined}
        />
      )}
      {screens[currentScreen].content}
    </>
  );
};
export default JoinKeygenView;
