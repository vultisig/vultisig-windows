import React, { useState } from "react";

const OnboardingView: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState(0);

  const nextScreen = () => {
    setCurrentScreen((prev) => (prev < screens.length - 1 ? prev + 1 : prev));
  };

  const screens = [
    {
      content: (
        <>
          <h1 className="text-4xl font-bold mb-2">Vultisig</h1>
          <p className="text-xl">SECURE CRYPTO VAULT</p>
        </>
      ),
    },
    {
      content: (
        <>
          <h2 className="text-2xl font-bold mb-2">
            Vultisig is a secure, multi-device crypto vault, compatible with all
            major blockchains and 10,000+ tokens. Vultisig is fully
            self-custodial.
          </h2>
        </>
      ),
    },
    {
      content: (
        <>
          <h2 className="text-2xl font-bold mb-2">
            Vultisig does not track your activities or require any
            registrations. Vultisig is fully open-source, ensuring transparency
            and trust.
          </h2>
        </>
      ),
    },
    {
      content: (
        <>
          <h2 className="text-2xl font-bold mb-2">
            Vultisig is natively a multi-device application. Requiring at least
            two devices to create a secure vault. One initiating and one pairing
            device.
          </h2>
        </>
      ),
    },
    {
      content: (
        <>
          <h2 className="text-2xl font-bold mb-2">
            Vultisig is a wallet without seed phrases. It uses easy-to-manage
            vault shares instead. Every device has its unique vault share that
            needs a separate backup.
          </h2>
        </>
      ),
    },
    {
      content: (
        <>
          <h2 className="text-2xl font-bold mb-2">Get Started</h2>
          <div className="flex gap-4 mt-4">
            <button className="bg-blue-500 text-white py-2 px-4 rounded">
              Create a New Vault
            </button>
            <button className="bg-transparent text-blue-500 border border-blue-500 py-2 px-4 rounded">
              Import an Existing Vault
            </button>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-6">
        {screens[currentScreen].content}
        <div className="flex justify-between mt-6">
          {currentScreen > 0 && (
            <button
              className="text-blue-500"
              onClick={() => setCurrentScreen(currentScreen - 1)}
            >
              Back
            </button>
          )}
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded"
            onClick={nextScreen}
          >
            {currentScreen === screens.length - 1 ? "Get Started" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingView;
