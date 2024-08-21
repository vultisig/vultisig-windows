import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RingProgress from '../ringProgress/RingProgress';
import { Vault } from '../../gen/vultisig/vault/v1/vault_pb';
import { KeygenType } from '../../model/TssType';
import { StartKeygen } from '../../../wailsjs/go/tss/TssService';
interface KeygenViewProps {
  vault: Vault;
  sessionID: string;
  devices: string[];
  hexEncryptionKey: string;
  keygenType: KeygenType; // is keygen / Reshare
  serverURL: string;
  onDone: () => void;
  onError: (err: string) => void;
}
const KeygenView: React.FC<KeygenViewProps> = ({
  vault,
  sessionID,
  devices,
  hexEncryptionKey,
  keygenType,
  serverURL,
  onDone,
  onError,
}) => {
  const { t } = useTranslation();
  const [contentIndex, setContentIndex] = useState<number>(0);
  const [allSigners, setAllSigners] = useState<string[]>(devices);

  useEffect(() => {
    // when isRelay = false , need to discover the local mediator
    if (keygenType === KeygenType.Keygen) {
      const neVault = StartKeygen(
        vault.name,
        vault.localPartyId,
        sessionID,
        vault.hexChainCode,
        hexEncryptionKey,
        serverURL
      ).catch(err => {
        onError(err);
      });
      if (neVault !== undefined) {
        onDone();
      }
    }
  }, []);

  const runSliders = () => {
    if (contentIndex < contents.length - 1) {
      setContentIndex(contentIndex + 1);
    } else {
      setContentIndex(0);
    }
  };

  useEffect(() => {
    setTimeout(runSliders, 3000);
  }, [contentIndex]);

  const contents = [
    {
      title: t('join_keygen_slider1_title'),
      note: (
        <>
          {t('join_keygen_slider1_note1')}{' '}
          <span className="text-secondary">
            {t('join_keygen_slider1_note2')}
          </span>
          . {t('join_keygen_slider1_note3')}
        </>
      ),
      slider: '/assets/images/keygenSlider1.svg',
    },
    {
      title: t('join_keygen_slider2_title'),
      note: (
        <>
          <span className="text-secondary">
            {t('join_keygen_slider2_note1')}
          </span>
          ! {t('join_keygen_slider2_note2')}
        </>
      ),
      slider: '/assets/images/keygenSlider2.svg',
    },
    {
      title: t('join_keygen_slider3_title'),
      note: (
        <>
          {t('join_keygen_slider3_note1')}{' '}
          <span className="text-secondary">
            {t('join_keygen_slider3_note2')}
          </span>
          . {t('join_keygen_slider3_note3')}
        </>
      ),
      slider: '/assets/images/keygenSlider3.svg',
    },
    {
      title: t('join_keygen_slider4_title'),
      note: (
        <>
          {t('join_keygen_slider4_note1')}{' '}
          <span className="text-secondary">
            {t('join_keygen_slider4_note2')}
          </span>{' '}
          {t('join_keygen_slider4_note3')}
        </>
      ),
      slider: '/assets/images/keygenSlider4.svg',
    },
    {
      title: t('join_keygen_slider5_title'),
      note: (
        <>
          {t('join_keygen_slider5_note1')}{' '}
          <span className="text-secondary">
            {t('join_keygen_slider5_note2')}
          </span>{' '}
          {t('join_keygen_slider5_note3')}
        </>
      ),
      slider: '/assets/images/keygenSlider5.svg',
    },
    {
      title: t('join_keygen_slider6_title'),
      note: (
        <>
          {t('join_keygen_slider6_note1')}{' '}
          <span className="text-secondary">
            {t('join_keygen_slider6_note2')}
          </span>
          .
        </>
      ),
      slider: '/assets/images/keygenSlider6.svg',
    },
    {
      title: t('join_keygen_slider7_title'),
      note: (
        <>
          {t('join_keygen_slider7_note1')}{' '}
          <span className="text-secondary">
            {t('join_keygen_slider7_note2')}
          </span>
          {', '}
          {t('join_keygen_slider7_note3')}
        </>
      ),
      slider: '/assets/images/keygenSlider7.svg',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center pt-20 text-white text-sm">
      <RingProgress size={100} strokeWidth={10} progress={40} />
      <p className="mt-5">{t('prepareVault')}</p>
      <p className="mt-10 font-bold text-xl">{contents[contentIndex].title}</p>
      <p className="mt-5 w-80 h-28 text-center">
        {contents[contentIndex].note}
      </p>
      <img src={contents[contentIndex].slider} alt="slider" className="mb-32" />
      <img
        src="/assets/icons/wifi.svg"
        alt="wifi"
        className="mx-auto mb-4 w-8"
      />
      <p>{t('devices_on_same_wifi')}</p>
    </div>
  );
};

export default KeygenView;
