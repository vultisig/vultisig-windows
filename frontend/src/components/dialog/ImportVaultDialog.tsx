import React from "react";

interface DialogProps {
  isOpen: boolean;
  title: string;
  content: string;
  onClose: () => void;
  onOk: (passwd: string) => void;
}

const ImportVaultDialog: React.FC<DialogProps> = ({
  isOpen,
  title,
  content,
  onClose,
  onOk,
}) => {
  const [passwd, setPasswd] = React.useState("");

  if (!isOpen) return null;

  const handleOk = () => {
    onOk(passwd);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-neutral-800 p-6 rounded-lg shadow-lg w-full w-[350px] text-white border border-gray-700">
        <img
          src="/assets/images/LogoRadiation.svg"
          alt="Logo"
          className="w-24 mx-auto object-cover mb-4"
        />
        <h2 className="text-base font-bold mb-4 text-center">{title}</h2>
        {content === "" && (
          <div className="text-sm">
            <input
              type="password"
              value={passwd}
              onChange={(e) => setPasswd(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4 text-gray bg-neutral-700"
              placeholder="Password"
            />
            <div className="flex justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 rounded-lg w-1/2 mr-4"
              >
                Cancel
              </button>
              <button
                onClick={handleOk}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg w-1/2"
              >
                OK
              </button>
            </div>
          </div>
        )}
        {content !== "" && (
          <div className="text-sm text-center">
            {content}
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg w-full"
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportVaultDialog;
