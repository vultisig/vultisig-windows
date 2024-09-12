import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { VStack } from '../../lib/ui/layout/Stack';
import { PageContent } from '../../ui/page/PageContent';
import { useHasFinishedOnboarding } from '../../onboarding/hooks/useHasFinishedOnboarding';

const OnboardingView: React.FC = () => {
  const { t } = useTranslation();
  const [currentScreen, setCurrentScreen] = useState(0);

  const [, hasFinishedOnboarding] = useHasFinishedOnboarding();

  const completeOnboarding = () => {
    hasFinishedOnboarding(true);
  };

  const screens = [
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
          <h2 className="text-xl text-white w-[500px]">
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
          <h2 className="text-xl text-white w-[500px]">
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
          <h2 className="text-xl text-white w-[500px]">
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
          <h2 className="text-xl text-white w-[500px]">
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
  ];

  const isLastScreen = currentScreen === screens.length - 1;

  return (
    <PageContent>
      <VStack alignItems="center" justifyContent="center" flexGrow>
        {screens[currentScreen].content}
      </VStack>
      <div className="flex justify-center mt-10">
        <button
          className="bg-secondary text-btn-primary mr-20 rounded-full w-[180px] font-bold"
          onClick={() => {
            if (isLastScreen) {
              completeOnboarding();
            } else {
              setCurrentScreen(prev => prev + 1);
            }
          }}
        >
          {t('next')}
        </button>
        <button
          className="text-secondary border border-secondary border-solid py-2 px-4 rounded-full w-[180px] font-bold"
          onClick={completeOnboarding}
        >
          {t('skip')}
        </button>
      </div>
    </PageContent>
  );
};

export default OnboardingView;
