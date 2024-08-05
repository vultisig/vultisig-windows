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
  const [currentScreen, setCurrentScreen] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<number>(0);

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
                setCurrentScreen(1);
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
  ];

  return <>{screens[currentScreen].content}</>;
};

export default TabbedContent;
