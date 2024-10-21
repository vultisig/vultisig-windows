import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import ImportVaultDialog from '../../components/dialog/ImportVaultDialog';
import NavBar from '../../components/navbar/NavBar';
import { VaultContainer } from '../../gen/vultisig/vault/v1/vault_container_pb';
import { Vault } from '../../gen/vultisig/vault/v1/vault_pb';
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
  const [encryptedVaultContent, setEncryptedVaultContent] =
    useState<Buffer | null>(null);
  const [decryptedVaultContent, setDecryptedVaultContent] =
    useState<Buffer | null>(null);
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
      if (
        !event.target.files[0].name.endsWith('.bak') &&
        !event.target.files[0].name.endsWith('.vult') &&
        !event.target.files[0].name.endsWith('.dat')
      ) {
        setDialogTitle(t('invalid_file_format'));
        setDialogContent(t('invalid_file_format_message'));
        setDialogOpen(true);
      } else {
        setSelectedFile(event.target.files[0]);
        const reader = new FileReader();
        reader.onload = () => {
          const data = reader.result;

          if (event.target.files) {
            console.log(event.target.files);
            console.log(event.target.files[0]?.name);
            console.log(event.target.files[0]?.name?.endsWith('.dat'));

            console.log(data);
            console.log(data?.toString());

            try {
              // Assuming HEX string, decode it to Uint8Array
              const decodedData = walletcore.HexCoding.decode(
                data?.toString() ?? ''
              );

              // Assuming HEX string, encode it to Uint8Array
              console.log(decodedData);

              // Convert the ArrayBuffer to a string (assuming the binary data is JSON)
              const textDecoder = new TextDecoder('utf-8');
              const jsonString = textDecoder.decode(decodedData);

              console.log(jsonString);

              // Parse the JSON string
              const jsonObject = JSON.parse(jsonString);

              // do not try to convert this to VaultContainer there are not the same object
              // So the convertion must be manual
              /*
              Example:
                This will not work
                const vault = Vault.fromBinary(decryptedVaultContent as unknown as Uint8Array);
              */
              console.log(jsonObject);
            } catch (error) {
              console.error('Error decoding hex data:', error);
              setDialogTitle(t('invalid_file_content'));
              setDialogContent(t('invalid_file_content_message'));
              setDialogOpen(true);
              return;
            }
          }

          setFileContent('');
          setContinue(false);
          if (data && isBase64Encoded(data.toString())) {
            setFileContent(data.toString());
            const decodedData = Buffer.from(data.toString(), 'base64');
            const vaultContainer = VaultContainer.fromBinary(
              decodedData as unknown as Uint8Array
            );

            if (isBase64Encoded(vaultContainer.vault)) {
              const encryptedContent = Buffer.from(
                vaultContainer.vault.toString(),
                'base64'
              );
              setEncryptedVaultContent(encryptedContent);
              if (vaultContainer.isEncrypted) {
                setDialogTitle(t('enter_password'));
                setDialogContent('');
                setDialogOpen(true);
              } else {
                setDecryptedVaultContent(encryptedContent);
                setContinue(true);
              }
            } else {
              setDialogTitle(t('invalid_vault_data'));
              setDialogContent(t('invalid_vault_data_message'));
              setDialogOpen(true);
            }
          } else {
            setDialogTitle(t('invalid_file_content'));
            setDialogContent(t('invalid_file_content_message'));
            setDialogOpen(true);
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
    setEncryptedVaultContent(null);
    setDecryptedVaultContent(null);
  };

  const handleCloseDialog = () => setDialogOpen(false);

  const handleOk = (passwd: string) => {
    if (encryptedVaultContent) {
      try {
        const decryptedVault = vaultService.decryptVault(
          passwd,
          encryptedVaultContent
        );
        setDecryptedVaultContent(decryptedVault);
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
    if (decryptedVaultContent) {
      try {
        const vault = Vault.fromBinary(
          decryptedVaultContent as unknown as Uint8Array
        );

        if (vaults.some(v => v.public_key_ecdsa === vault.publicKeyEcdsa)) {
          setDialogTitle(t('vault_already_exists'));
          setDialogContent(t('vault_already_exists_message'));
          setDialogOpen(true);
          return;
        }

        await vaultService.importVault(decryptedVaultContent);
        await invalidateQueries(vaultsQueryKey);
        navigate(makeAppPath('vaultList'));
      } catch (e: unknown) {
        setDialogTitle(t('invalid_vault_data'));
        setDialogContent(t('invalid_vault_data_message'));
        setDialogOpen(true);
        console.error(e);
      }
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
            {isContinue && decryptedVaultContent && (
              <div
                className="break-all h-[230px] px-4 py-4 overflow-hidden overflow-ellipsis text-base font-normal"
                style={{
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 9,
                }}
              >
                {decryptedVaultContent.toString('hex')}
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
