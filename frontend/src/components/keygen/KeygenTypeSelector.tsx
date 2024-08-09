import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface KeygenTypeSelectorProps {
  onContinue: () => void;
}

interface TabContent {
  title: string;
  description: string;
  image: string;
}

const KeygenTypeSelector: React.FC<KeygenTypeSelectorProps> = ({
  onContinue,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<number>(0);

  const tabs: TabContent[] = [
    {
      title: t('2_of_2_vault'),
      description: t('vault_type_1_description'),
      image: '/assets/images/vaultSetup1.svg',
    },
    {
      title: t('2_of_3_vault'),
      description: t('vault_type_2_description'),
      image: '/assets/images/vaultSetup2.svg',
    },
    {
      title: t('m_of_n_vault'),
      description: t('vault_type_3_description'),
      image: '/assets/images/vaultSetup3.svg',
    },
  ];

  return (
    <div className="text-white mx-auto max-w-4xl pt-8">
      <p className="text-center mb-8">{t('select_your_vault_type')}</p>
      <div className="flex justify-center space-x-4">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`py-2 px-4 border-b-2 ${
              activeTab === index ? 'border-blue-500' : 'border-transparent'
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab.title}
          </button>
        ))}
      </div>
      <div className="mt-12 text-center">
        <p className="mb-8 text-sm">{tabs[activeTab].description}</p>
        <img
          src={tabs[activeTab].image}
          alt="vault_setup"
          className="mx-auto mb-4 w-60"
        />
        <img
          src="/assets/images/wifi.svg"
          alt="wifi"
          className="mx-auto mb-4 w-8"
        />
        <p className="mb-4">{t('devices_on_same_wifi')}</p>
      </div>
      <div className="flex justify-center mt-8">
        <button
          className="bg-secondary text-btn-primary rounded-full w-[250px] py-2 font-bold"
          onClick={onContinue}
        >
          {t('start')}
        </button>
      </div>
    </div>
  );
};

export default KeygenTypeSelector;
