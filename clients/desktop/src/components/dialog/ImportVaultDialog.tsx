import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [passwd, setPasswd] = React.useState('');

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]); // Dependency array includes isVisible

  const handleClose = () => {
    setPasswd('');
    onClose();
  };

  const handleOk = () => {
    onOk(passwd);
    handleClose();
  };

  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-neutral-800 p-6 rounded-lg shadow-lg w-[350px] text-white border border-gray-700">
        <img
          src="/assets/images/logoRadiation.svg"
          alt="Logo"
          className="w-24 mx-auto object-cover mb-4"
        />
        <h2 className="text-base font-bold mb-4 text-center">{title}</h2>
        {content === '' && (
          <div className="text-sm">
            <input
              type="password"
              ref={inputRef}
              value={passwd}
              onChange={e => setPasswd(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4 text-gray bg-neutral-700"
              placeholder="Password"
            />
            <div className="flex justify-between">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-blue-500 rounded-lg w-1/2 mr-4"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleOk}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg w-1/2"
              >
                {t('ok')}
              </button>
            </div>
          </div>
        )}
        {content && (
          <div className="text-sm text-center">
            {content}
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg w-full"
            >
              {t('ok')}
            </button>
          </div>
        )}
      </div>
    </div>
  ) : null;
};

export default ImportVaultDialog;
