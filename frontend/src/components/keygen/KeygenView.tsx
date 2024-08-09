import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RingProgress from '../ringProgress/RingProgress';

const KeygenView: React.FC = () => {
  const { t } = useTranslation();
  const [contentIndex, setContentIndex] = useState<number>(0);

  const runSliders = () => {
    if (contentIndex < contents.length - 1) {
      setContentIndex(contentIndex + 1);
    } else {
      setContentIndex(0);
    }
    setTimeout(runSliders, 3000);
  };

  useEffect(() => {
    runSliders();
  }, []);

  const contents = [
    {
      title: t('join_keygen_slider1_title'),
      note: t('join_keygen_slider1_note1'),
      slider: '/assets/images/keygenSlider1.svg',
    },
  ];

  return (
    <div className="flex items-center pt-10">
      <RingProgress size={100} strokeWidth={10} progress={40} />
      <p className="mb-8">{t('prepareVault')}</p>
      <p className="mb-4">contents[contentIndex].title</p>
      <p>contents[contentIndex].note</p>
      <div className="fixed bottom-16">
        <img
          src={contents[contentIndex].slider}
          alt="slider"
          className="mb-32"
        />
        <img
          src="/assets/images/wifi.svg"
          alt="wifi"
          className="mx-auto mb-4 w-8"
        />
        <p className="mb-4">{t('devices_on_same_wifi')}</p>
      </div>
    </div>
  );
};

export default KeygenView;
