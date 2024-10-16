import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import ImportVaultDialog from '../../components/dialog/ImportVaultDialog';
import NavBar from '../../components/navbar/NavBar';
import { VaultContainer } from '../../gen/vultisig/vault/v1/vault_container_pb';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { makeAppPath } from '../../navigation';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { VaultServiceFactory } from '../../services/Vault/VaultServiceFactory';
import { isBase64Encoded } from '../../utils/util';
import {
  useVaultsQuery,
  vaultsQueryKey,
} from '../../vault/queries/useVaultsQuery';

const ImportVaultView: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [isContinue, setContinue] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogContent, setDialogContent] = useState('');
  const [decryptedContent, setDecryptedContent] = useState<Buffer | null>();
  const walletcore = useAssertWalletCore();
  const { data: vaults = [] } = useVaultsQuery();

  const invalidateQueries = useInvalidateQueries();

  const vaultService = VaultServiceFactory.getService(walletcore);

  const handleUpload = () => {
    const fileInput = document.getElementById('file_upload');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      if (!event.target.files[0].name.endsWith('.bak')) {
        setDialogTitle(t('invalid_file_format'));
        setDialogContent(t('invalid_file_format_message'));
        setDialogOpen(true);
      } else {
        setSelectedFile(event.target.files[0]);
        const reader = new FileReader();
        reader.onload = () => {
          const data = reader.result;
          setFileContent('');
          setContinue(false);
          if (data && isBase64Encoded(data.toString())) {
            setFileContent(data.toString());
            const decodedData = Buffer.from(data.toString(), 'base64');
            const vaultContainer = VaultContainer.fromBinary(
              decodedData as unknown as Uint8Array
            );

            const decodedVault = Buffer.from(
              vaultContainer.vault,
              'base64'
            ).toString('utf-8');
            const pubKeyMatch = decodedVault.match(/"pub_key":\s*"([^"]+)"/);

            if (pubKeyMatch && pubKeyMatch[1]) {
              const publicKey = pubKeyMatch[1];
              if (vaults.some(vault => vault.public_key_ecdsa === publicKey)) {
                setDialogTitle(t('vault_already_exists'));
                setDialogContent(t('vault_already_exists_message'));
                setDialogOpen(true);
                return;
              }
            } else {
              setDialogTitle(t('vault_missing_public_key'));
              setDialogContent(t('vault_missing_public_key_message'));
              setDialogOpen(true);
              return;
            }

            if (isBase64Encoded(vaultContainer.vault)) {
              const decodedVault = Buffer.from(
                vaultContainer.vault.toString(),
                'base64'
              );
              setDecryptedContent(decodedVault);
              if (vaultContainer.isEncrypted) {
                setDialogTitle(t('enter_password'));
                setDialogContent('');
                setDialogOpen(true);
              } else {
                setContinue(true);
              }
            }
          }
        };
        reader.readAsText(event.target.files[0]);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setFileContent('');
    setContinue(false);
  };

  const handleCloseDialog = () => setDialogOpen(false);

  const handleOk = (passwd: string) => {
    if (decryptedContent) {
      try {
        const decrptedVault = vaultService.decryptVault(
          passwd,
          decryptedContent
        );
        setDecryptedContent(decrptedVault);
        setContinue(true);
      } catch {
        setDialogTitle(t('incorrect_password'));
        setDialogContent(t('backup_decryption_failed'));
        setTimeout(() => {
          setDialogOpen(true);
        }, 0);
      }
    }
  };

  const handleContinue = async () => {
    if (decryptedContent) {
      await vaultService.importVault(decryptedContent);
      await invalidateQueries(vaultsQueryKey);
      navigate(makeAppPath('vaultList'));
    }
  };

  return (
    <>
      <NavBar title={t('import')} />
      <input
        id="file_upload"
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="text-white pt-[5vh]">
        <div className="text-center px-20">
          <h6 className="text-lg mb-8">{t('upload_previous_vault')}</h6>
          <div
            className="w-full bg-secondary/[.14] h-[250px] border-2 border-dashed border-secondary rounded-lg font-bold cursor-pointer"
            onClick={handleUpload}
            role="none"
          >
            {isContinue && decryptedContent && (
              <div
                className="break-all h-[230px] px-4 py-4 overflow-hidden overflow-ellipsis text-base font-normal"
                style={{
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 9,
                }}
              >
                {decryptedContent.toString('hex')}
              </div>
            )}
            {!isContinue && (
              <>
                <img
                  src="/assets/images/file.svg"
                  className="mx-auto mb-4 mt-20"
                  alt="file"
                />
                {t('select_backup_file')}
              </>
            )}
          </div>
          {selectedFile && fileContent && isContinue && (
            <div className="flex justify-between mt-8">
              <div className="flex">
                <img
                  src="/assets/images/file.svg"
                  className="ml-4 mr-2 w-6"
                  alt="file"
                />
                {selectedFile.name}
              </div>
              <img
                src="/assets/icons/cancel.svg"
                className="mr-4 w-4 cursor-pointer"
                alt="cancel"
                role="presentation"
                onClick={handleCancel}
              />
            </div>
          )}
          <button
            className={`text-lg rounded-full w-full font-bold py-2 mt-60 ${
              isContinue
                ? 'text-btn-primary bg-secondary'
                : 'text-btn-secondary bg-white/[.10]'
            }`}
            disabled={!isContinue}
            onClick={handleContinue}
          >
            {t('continue')}
          </button>
        </div>
      </div>
      <ImportVaultDialog
        title={dialogTitle}
        content={dialogContent}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onOk={handleOk}
      />
    </>
  );
};

export default ImportVaultView;
