import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface TabContent {
  title: string;
  description1: string;
  description2: string;
  description3: string;
  image: string;
}

const TabbedContent: React.FC = () => {
  const { t } = useTranslation();
  const [currentScreen, setCurrentScreen] = useState<number>(3);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [vaultName, setVaultName] = useState<string>(t("main_vault"));
  const [devices, setDevices] = useState<string[]>([
    "hello",
    "macbook 123123",
    "test",
  ]);
  const [localPartyId, setLocalPartyId] = useState<string>("");

  const nextScreen = () => {
    setCurrentScreen((prev) => (prev < screens.length - 1 ? prev + 1 : prev));
  };

  // const prevScreen = () => {
  //   setCurrentScreen((prev) => (prev > 0 ? prev - 1 : prev));
  // };

  const tabs: TabContent[] = [
    {
      title: t("2_of_2_vault"),
      description1: `${t("need_min_devices")} 2 ${t("devices")}`,
      description2: `1. ${t("start_from_one_device")}`,
      description3: `2. ${t("pair_from_the")} ${t("second")} ${t("device")}`,
      image: "/assets/images/vaultSetup1.svg",
    },
    {
      title: t("2_of_3_vault"),
      description1: `${t("need_min_devices")} 3 ${t("devices")}`,
      description2: `1. ${t("start_from_one_device")}`,
      description3: `2. ${t("pair_from_the")} ${t("second_and_third")} ${t(
        "device"
      )}`,
      image: "/assets/images/vaultSetup2.svg",
    },
    {
      title: t("m_of_n_vault"),
      description1: t("m_of_n_vault"),
      description2: `1. ${t("start_from_one_device")}`,
      description3: `2. ${t("pair_from_the")} ${t("other")} ${t("device")}`,
      image: "/assets/images/vaultSetup3.svg",
    },
  ];

  // screens
  // 0 - vault setup view
  // 1 - vault name setup
  // 2 - keygen peer discovery screens
  // 3 - keygen verify
  // ...
  const screens = [
    {
      content: (
        <div className="text-white mx-auto max-w-4xl pt-16">
          <div className="flex justify-center space-x-4">
            {tabs.map((tab, index) => (
              <button
                key={index}
                className={`py-2 px-4 border-b-2 ${
                  activeTab === index ? "border-blue-500" : "border-transparent"
                }`}
                onClick={() => setActiveTab(index)}
              >
                {tab.title}
              </button>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="mb-8">
              {tabs[activeTab].description1}
              <br />
              {tabs[activeTab].description2}
              <br />
              {tabs[activeTab].description3}
            </p>
            <img
              src={tabs[activeTab].image}
              alt="image"
              className="mx-auto mb-4 w-60"
            />
            <img
              src="/assets/images/wifi.svg"
              alt="wifi"
              className="mx-auto mb-4 w-8"
            />
            <p className="mb-4">{t("devices_on_same_wifi")}</p>
          </div>
          <div className="flex justify-center mt-12">
            <button
              className="bg-[#33E6BF] text-[#061B3A] mr-20 rounded-full w-[250px] font-bold"
              onClick={() => {
                nextScreen();
              }}
            >
              {t("start")}
            </button>
            <button
              className="text-[#33E6BF] border border-[#33E6BF] border-solid py-2 px-4 rounded-full w-[250px] font-bold"
              onClick={() => {}}
            >
              {t("pair")}
            </button>
          </div>
        </div>
      ),
    },
    {
      content: (
        <div className="text-white flex flex-col items-center justify-center h-screen">
          <div className="-mt-4">
            <label htmlFor="input" className="block text-md mb-2">
              {t("vault_name")}
            </label>
            <input
              id="input"
              type="text"
              value={vaultName}
              onChange={(e) => {
                setVaultName(e.target.value);
              }}
              className="font-bold bg-white/[.10] rounded-lg w-80 py-2 px-3"
            />
          </div>
          <button
            className={`text-lg rounded-full w-80 font-bold py-2 mt-16 ${
              vaultName !== ""
                ? "text-[#061B3A] bg-[#33E6BF]"
                : "text-[#BDBDBD] bg-white/[.10]"
            }`}
            disabled={vaultName === ""}
            onClick={() => {
              nextScreen();
            }}
          >
            {t("continue")}
          </button>
        </div>
      ),
    },
    {
      content: <></>, // keygen peer discovery view
    },
    {
      content: (
        <div className="text-white flex flex-col items-center justify-center">
          <div className="mt-4">
            {Math.ceil((2 * devices.length) / 3)}
            {" of "}
            {devices.length}
          </div>
          <div>
            <p>{t("with_these_devices")}</p>
            {devices.map((device, index) => {
              let pairDeviceCount = Math.ceil((2 * devices.length) / 3);
              pairDeviceCount -= device === localPartyId ? 0 : 1;
              const deviceState =
                device === localPartyId
                  ? t("this_device")
                  : pairDeviceCount > 0
                  ? t("pair_device")
                  : t("backup_device");
              return (
                <>
                  {index}
                  {". "}
                  {device}
                  {" ("}
                  {deviceState}
                  {")"}
                </>
              );
            })}
          </div>
          <div className="mt-8">
            {t("pair_device_disclaimers_first")}{" "}
            {Math.ceil((2 * devices.length) / 3)}{" "}
            {t("pair_device_disclaimers_second")}
          </div>
          <div className="mt-8">
            {devices.length > 2
              ? t("backup_not_needed_disclaimer")
              : t("no_backup_device_disclaimer")}
          </div>
          <button
            className="text-lg rounded-full w-80 font-bold py-2 mt-4 text-[#061B3A] bg-[#33E6BF]"
            onClick={() => {
              nextScreen();
            }}
          >
            {t("continue")}
          </button>
        </div>
      ),
    },
  ];

  return <>{screens[currentScreen].content}</>;
};

export default TabbedContent;
