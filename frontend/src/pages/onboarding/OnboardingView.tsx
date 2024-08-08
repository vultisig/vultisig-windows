import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const OnboardingView: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentScreen, setCurrentScreen] = useState(0);

  const nextScreen = () => {
    setCurrentScreen(prev => (prev < screens.length - 1 ? prev + 1 : prev));
  };

  const skipScreen = () => {
    setCurrentScreen(screens.length - 1);
  };

  useEffect(() => {
    const visitedBefore = sessionStorage.getItem('homePageVisited');
    if (!visitedBefore) {
      setTimeout(() => {
        sessionStorage.setItem('homePageVisited', 'true');
        const flag = localStorage.getItem('isFirstTime');
        if (!flag) {
          setCurrentScreen(1);
          localStorage.setItem('isFirstTime', 'no');
        } else {
          skipScreen();
        }
      }, 1000);
    } else {
      skipScreen();
    }
  }, []);

  const screens = [
    {
      content: (
        <div className="text-center mt-[20vh]">
          <img
            src="assets/images/logoRadiation.svg"
            className="mx-auto mb-4 h-[220px]"
            alt="Logo"
          />
          <h1 className="text-3xl font-bold mb-8">{t('vultisig')}</h1>
          <p className="text-xl">{t('secure_crypto_vault')}</p>
        </div>
      ),
    },
    {
      content: (
        <div className="text-center mt-[10vh]">
          <img
            className="mx-auto mb-20"
            src="assets/images/logoWithTitle.svg"
            alt="logoWithTitle"
          />
          <img
            className="mx-auto mb-10 h-[220px]"
            src="assets/images/Onboarding1.svg"
            alt="Onboarding1"
          />
          <h2 className="text-xl w-[500px]">
            {t('onboarding_view1_description')}
          </h2>
          <img
            className="mx-auto mt-10"
            src="assets/images/pageSlider1.svg"
            alt="pageSlider1"
          />
        </div>
      ),
    },
    {
      content: (
        <div className="text-center mt-[10vh]">
          <img
            className="mx-auto mb-20"
            src="assets/images/logoWithTitle.svg"
            alt="logoWithTitle"
          />
          <img
            className="mx-auto mb-10 h-[220px]"
            src="assets/images/Onboarding2.svg"
            alt="Onboarding2"
          />
          <h2 className="text-xl w-[500px]">
            {t('onboarding_view2_description')}
          </h2>
          <img
            className="mx-auto mt-10"
            src="assets/images/pageSlider2.svg"
            alt="pageSlider2"
          />
        </div>
      ),
    },
    {
      content: (
        <div className="text-center mt-[10vh]">
          <img
            className="mx-auto mb-20"
            src="assets/images/logoWithTitle.svg"
            alt="logoWithTitle"
          />
          <img
            className="mx-auto mb-10 h-[220px]"
            src="assets/images/Onboarding3.svg"
            alt="Onboarding3"
          />
          <h2 className="text-xl w-[500px]">
            {t('onboarding_view3_description')}
          </h2>
          <img
            className="mx-auto mt-10"
            src="assets/images/pageSlider3.svg"
            alt="pageSlider3"
          />
        </div>
      ),
    },
    {
      content: (
        <div className="text-center mt-[10vh]">
          <img
            className="mx-auto mb-20"
            src="assets/images/logoWithTitle.svg"
            alt="logoWithTitle"
          />
          <img
            className="mx-auto mb-10 h-[220px]"
            src="assets/images/Onboarding4.svg"
            alt="Onboarding4"
          />
          <h2 className="text-xl w-[500px]">
            {t('onboarding_view4_description')}
          </h2>
          <img
            className="mx-auto mt-10"
            src="assets/images/pageSlider4.svg"
            alt="pageSlider4"
          />
        </div>
      ),
    },
    {
      content: (
        <div className="text-center mt-[20vh]">
          <img
            src="assets/images/logoRadiation.svg"
            className="mx-auto mb-4 h-[220px]"
            alt="Logo"
          />
          <h1 className="text-3xl font-bold mb-8">{t('vultisig')}</h1>
          <p className="text-xl">{t('secure_crypto_vault')}</p>
          <div className="flex justify-center mt-24">
            <button
              className="bg-secondary text-btn-primary mr-20 rounded-full w-[250px] font-bold"
              onClick={() => {
                navigate('/vault/setup');
              }}
            >
              {t('create_new_vault')}
            </button>
            <button
              className="text-secondary border border-secondary border-solid py-2 px-4 rounded-full w-[250px] font-bold"
              onClick={() => {
                navigate('/vault/import');
              }}
            >
              {t('import_existing_vault')}
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="text-white flex items-center justify-center">
        {screens[currentScreen].content}
      </div>
      {currentScreen > 0 && currentScreen < screens.length - 1 && (
        <div className="flex justify-center mt-10">
          <button
            className="bg-secondary text-btn-primary mr-20 rounded-full w-[180px] font-bold"
            onClick={nextScreen}
          >
            {t('next')}
          </button>
          <button
            className="text-secondary border border-secondary border-solid py-2 px-4 rounded-full w-[180px] font-bold"
            onClick={skipScreen}
          >
            {t('skip')}
          </button>
        </div>
      )}
    </>
  );
};

export default OnboardingView;
