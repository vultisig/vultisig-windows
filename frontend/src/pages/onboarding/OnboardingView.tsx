import React, { useEffect, useState } from "react";

const OnboardingView: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState(0);

  const nextScreen = () => {
    setCurrentScreen((prev) => (prev < screens.length - 1 ? prev + 1 : prev));
  };

  const skipScreen = () => {
    setCurrentScreen(screens.length - 1);
  };

  useEffect(() => {
    const flag = localStorage.getItem("isFirstTime");
    setTimeout(() => {
      if (!flag) {
        setCurrentScreen(1);
        localStorage.setItem("isFirstTime", "no");
      } else {
        setCurrentScreen(screens.length - 1);
      }
    }, 1000);
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
          <h1 className="text-3xl font-bold mb-8">Vultisig</h1>
          <p className="text-xl">SECURE CRYPTO VAULT</p>
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
            Vultisig is a secure, multi-device crypto vault, compatible with all
            major blockchains and 10,000+ tokens.
            <br /> Vultisig is fully self-custodial.
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
            Vultisig does not track your activities or require any
            registrations. Vultisig is fully open-source, ensuring transparency
            and trust.
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
            Vultisig is natively a multi-device application. Requiring at least
            two devices to create a secure vault. One initiating and one pairing
            device.
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
            Vultisig is a wallet without seed phrases. It uses easy-to-manage
            vault shares instead. Every device has its unique vault share that
            needs a separate backup.
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
          <h1 className="text-3xl font-bold mb-8">Vultisig</h1>
          <p className="text-xl">SECURE CRYPTO VAULT</p>
          <div className="flex justify-center mt-24">
            <button className="bg-[#33E6BF] text-[#061B3A] mr-20 rounded-full w-[250px] font-bold">
              Create a New Vault
            </button>
            <button className="text-[#33E6BF] border border-[#33E6BF] border-solid py-2 px-4 rounded-full w-[250px] font-bold">
              Import an Existing Vault
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
            className="bg-[#33E6BF] text-[#061B3A] mr-20 rounded-full w-[180px] font-bold"
            onClick={nextScreen}
          >
            Next
          </button>
          <button
            className="text-[#33E6BF] border border-[#33E6BF] border-solid py-2 px-4 rounded-full w-[180px] font-bold"
            onClick={skipScreen}
          >
            Skip
          </button>
        </div>
      )}
    </>
  );
};

export default OnboardingView;
