import React from 'react';
import { useTranslation } from 'react-i18next';
interface KeygenQRCodeProps {
  devices: string[];
  selectedDevices: string[];
  setSelectedDevices: React.Dispatch<React.SetStateAction<string[]>>;
}
const SelectDevice: React.FC<KeygenQRCodeProps> = ({
  devices,
  setSelectedDevices,
}) => {
  const { t } = useTranslation();

  const checkHandler = (index: number) => {
    const device = devices[index];
    setSelectedDevices(prevSelectedDevices =>
      prevSelectedDevices.includes(device)
        ? prevSelectedDevices.filter(d => d !== device)
        : [...prevSelectedDevices, device]
    );
  };

  return (
    <>
      <h3 className="mt-5 font-semibold">{t('select_the_pairing_devices')}</h3>
      <div className="flex flex-wrap justify-center w-full items-center gap-10 my-2">
        {devices.map((device, index) => (
          <div
            key={index}
            className="relative bg-btn-primary rounded-lg text-center w-[120px] p-3 rounded-lg hover:border hover:border-white"
          >
            <div className="inline-flex items-center">
              <label
                className="py-3 rounded-full cursor-pointer"
                htmlFor={'device-' + index}
              >
                <input
                  type="checkbox"
                  onChange={() => checkHandler(index)}
                  className="absolute right-1 top-1 before:content[''] peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-gray-900/20 bg-white transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity  checked:border-gray-900  checked:before:bg-gray-900 hover:scale-105 hover:before:opacity-0"
                  id={'device-' + index}
                />
                <span className="absolute right-1 top-2 text-white transition-opacity opacity-0 pointer-events-none   -translate-x-2/4 peer-checked:opacity-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-2 w-2"
                    viewBox="0 0 20 20"
                    fill="#000000"
                    stroke="currentColor"
                    strokeWidth="0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </span>

                <img
                  src="/assets/images/phone.svg"
                  alt="phone"
                  className="mx-auto"
                />
                <b className="my-2 text-sm">{device}</b>
              </label>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default SelectDevice;
