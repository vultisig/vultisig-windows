import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import KeygenQRCode from "../../components/qrCode/KeygenQRCode";
import Lottie from "lottie-react";
import loadingAnimation from "../../../public/assets/images/loadingAnimation.json";
import SelectDevice from "../../components/selectDevice/SelectDevice";
import { useNavigate } from "react-router-dom";
import { createKeygenMsg } from "../../utils/QRGen";
interface KeygenPeerDiscoveryViewProps {
  vaultType: string;
}
const KeygenPeerDiscoveryView: React.FC<KeygenPeerDiscoveryViewProps> = ({
  vaultType,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [network, setNetwork] = useState("cellular");
  const [qrData, setQrData] = useState("");
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  useEffect(() => {
    async function createQR() {
      // sample vault
      setQrData(await createKeygenMsg("sample"));
    }
    createQR();
  }, [network]);
  // sample
  const devices = ["iPhone", "Phone2"];
  const handleContinue = () => {
    const minDevices = vaultType.split("/")[1];
    switch (minDevices) {
      case "n":
        return selectedDevices.length + 1 >= 2 ? false : true;
      case "3":
        return selectedDevices.length + 1 == 3 ? false : true;
      case "2":
        return selectedDevices.length + 1 == 2 ? false : true;
    }
  };

  return (
    <>
      <div>
        <img
          src="/assets/images/CaretLeft.svg"
          alt="Back"
          className="absolute left-5 top-5 cursor-pointer"
          onClick={() => navigate(-1)}
        />
        <h1 className="text-white text-xl font-semibold text-center pt-5">
          {t("keygen_peer_discovery_keygen_for")} {vaultType} {t("vault")}
        </h1>
      </div>

      <div className="mx-auto w-full  text-white text-center">
        <div>
          {/* sample data */}
          <KeygenQRCode data={qrData} />
        </div>
        <div className="flex gap-10 justify-center mt-5">
          <button
            onClick={() => setNetwork("cellular")}
            className={`${
              network == "cellular" ? "bg-[#1B3F73]" : "bg-[#11284A]"
            } rounded-3xl flex items-center justify-center w-[150px] py-2 gap-2`}
          >
            <img src="/assets/images/cellular.svg" alt="cellular" />{" "}
            {t("internet")}
          </button>
          <button
            onClick={() => setNetwork("wifi")}
            className={`${
              network == "wifi" ? "bg-[#1B3F73]" : "bg-[#11284A]"
            } rounded-3xl flex items-center justify-center w-[150px] py-2 gap-2`}
          >
            <img src="/assets/images/wifi.svg" alt="wifi" /> {t("local")}
          </button>
        </div>
        {devices.length == 0 ? (
          <>
            <h3 className="mt-5 font-semibold">
              {t("keygen_peer_discovery_looking_for")} {1}{" "}
              {t("keygen_peer_discovery_more_devices")}
            </h3>
            <div className="w-[100px] h-auto mx-auto">
              <Lottie animationData={loadingAnimation} loop={true} />
            </div>
          </>
        ) : (
          <SelectDevice
            devices={devices}
            selectedDevices={selectedDevices}
            setSelectedDevices={setSelectedDevices}
          />
        )}

        {network == "cellular" ? (
          <div>
            <img
              src="/assets/images/cellular.svg"
              alt="cellular"
              className="mx-auto my-2"
            />
            {t("peer_discovery_hint_connect_to_internet")}
          </div>
        ) : (
          <div>
            <img
              src="/assets/images/wifi.svg"
              alt="wifi"
              className="mx-auto my-2"
            />
            {t("peer_discovery_hint_connect_to_same_wifi")}
          </div>
        )}
        <button
          disabled={handleContinue()}
          className="w-[400px] disabled:opacity-30  bg-[#11284A] rounded-3xl mt-5 py-2 font-bold"
        >
          {t("continue")}
        </button>
      </div>
    </>
  );
};

export default KeygenPeerDiscoveryView;
