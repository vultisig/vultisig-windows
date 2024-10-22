import { Buffer } from 'buffer'; // Ensure Buffer is available
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import ImportVaultDialog from '../../components/dialog/ImportVaultDialog';
import NavBar from '../../components/navbar/NavBar';
import { VaultContainer } from '../../gen/vultisig/vault/v1/vault_container_pb';
import { Vault } from '../../gen/vultisig/vault/v1/vault_pb';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { extractError } from '../../lib/utils/error/extractError';
import { makeAppPath } from '../../navigation';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { VaultServiceFactory } from '../../services/Vault/VaultServiceFactory';
import { isBase64Encoded } from '../../utils/util';
import {
  useVaultsQuery,
  vaultsQueryKey,
} from '../../vault/queries/useVaultsQuery';

const ImportVaultView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isContinue, setContinue] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogContent, setDialogContent] = useState('');
  const [encryptedVaultContent, setEncryptedVaultContent] =
    useState<ArrayBuffer | null>(null);
  const [decryptedVaultContent, setDecryptedVaultContent] =
    useState<Uint8Array | null>(null);
  const [fileExtension, setFileExtension] = useState<string>('');
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
    if (!event.target.files) return;

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    setFileExtension(fileExt);

    if (!['bak', 'vult', 'dat'].includes(fileExt)) {
      setDialogTitle(t('invalid_file_format'));
      setDialogContent(t('invalid_file_format_message'));
      setDialogOpen(true);
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = async () => {
      const data = reader.result;

      setContinue(false);

      if (!data) {
        setDialogTitle(t('invalid_file_content'));
        setDialogContent(t('invalid_file_content_message'));
        setDialogOpen(true);
        return;
      }

      if (fileExt === 'dat') {
        const buffer = data as ArrayBuffer;
        const utf8Decoder = new TextDecoder('utf-8');
        const utf8String = utf8Decoder.decode(buffer);

        try {
          // Assuming HEX string, decode it to Uint8Array
          const decodedData = walletcore.HexCoding.decode(utf8String);

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

          // now you need to convert to the format you need to insert to storage.Vault...
          // not sure it will be here or in the next step

          setContinue(true);
        } catch (error) {
          console.error('Error decoding hex data:', error);
          // setDialogTitle(t('invalid_file_content'));
          // setDialogContent(t('invalid_file_content_message'));
          // setDialogOpen(true);

          console.info(error);
          // Not JSON, try interpreting as hex string
          const hexString = utf8String.trim().replace(/\s+/g, '');
          if (/^[0-9a-fA-F]+$/.test(hexString)) {
            try {
              const vaultBytes = Uint8Array.from(
                hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
              );
              setDecryptedVaultContent(vaultBytes);
              setContinue(true);
            } catch (hexError: unknown) {
              setEncryptedVaultContent(buffer);
              setDialogTitle(t('enter_password'));
              setDialogOpen(true);
              console.error(hexError);
            }
          } else {
            setEncryptedVaultContent(buffer);
            setDialogTitle(t('enter_password'));
            setDialogOpen(true);
          }

          return;
        }
      } else {
        const dataStr = Buffer.from(data as ArrayBuffer).toString('utf8');

        if (!isBase64Encoded(dataStr)) {
          setDialogTitle(t('invalid_file_content'));
          setDialogContent(t('invalid_file_content_message'));
          setDialogOpen(true);
          return;
        }

        const decodedData = Buffer.from(dataStr, 'base64');
        const vaultContainer = VaultContainer.fromBinary(
          decodedData as unknown as Uint8Array
        );

        if (!isBase64Encoded(vaultContainer.vault)) {
          setDialogTitle(t('invalid_vault_data'));
          setDialogContent(t('invalid_vault_data_message'));
          setDialogOpen(true);
          return;
        }

        const encryptedContent = Buffer.from(
          vaultContainer.vault.toString(),
          'base64'
        );
        setEncryptedVaultContent(encryptedContent.buffer);

        if (vaultContainer.isEncrypted) {
          setDialogTitle(t('enter_password'));
          setDialogContent('');
          setDialogOpen(true);
        } else {
          setDecryptedVaultContent(new Uint8Array(encryptedContent));
          setContinue(true);
        }
      }
    };

    reader.readAsArrayBuffer(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setContinue(false);
    setEncryptedVaultContent(null);
    setDecryptedVaultContent(null);
  };

  const handleCloseDialog = () => setDialogOpen(false);

  const handleOk = async (passwd: string) => {
    if (encryptedVaultContent) {
      try {
        let decryptedVault: ArrayBuffer;

        if (fileExtension === 'dat') {
          decryptedVault = await decryptData(encryptedVaultContent, passwd);
          setDecryptedVaultContent(new Uint8Array(decryptedVault));
        } else {
          const decryptedBuffer = vaultService.decryptVault(
            passwd,
            Buffer.from(encryptedVaultContent)
          );
          setDecryptedVaultContent(new Uint8Array(decryptedBuffer));
        }

        setContinue(true);
        setDialogOpen(false);
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
        let vault: Vault;
        const utf8String = new TextDecoder('utf-8').decode(
          decryptedVaultContent
        );

        try {
          const backupVault = JSON.parse(utf8String);

          if (backupVault.vault) {
            vault = Vault.fromJson(backupVault.vault);
          } else {
            // this wont work for dat files you must convert manually
            // the objects are not the same
            vault = Vault.fromJson(backupVault);
          }
        } catch (jsonError) {
          console.info(jsonError);
          const hexString = utf8String.trim().replace(/\s+/g, '');
          if (/^[0-9a-fA-F]+$/.test(hexString)) {
            const vaultBytes = Uint8Array.from(
              hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
            );
            try {
              vault = Vault.fromBinary(vaultBytes);
            } catch (hexParseError: unknown) {
              throw new Error(extractError(hexParseError));
            }
          } else if (isBase64Encoded(utf8String)) {
            const base64Data = Buffer.from(utf8String, 'base64');
            try {
              vault = Vault.fromBinary(new Uint8Array(base64Data));
            } catch (base64Error: unknown) {
              throw new Error(extractError(base64Error));
            }
          } else {
            try {
              vault = Vault.fromBinary(decryptedVaultContent);
            } catch (binaryParseError) {
              throw new Error(extractError(binaryParseError));
            }
          }
        }

        if (vaults.some(v => v.public_key_ecdsa === vault.publicKeyEcdsa)) {
          setDialogTitle(t('vault_already_exists'));
          setDialogContent(t('vault_already_exists_message'));
          setDialogOpen(true);
          return;
        }

        await vaultService.importVault(Buffer.from(decryptedVaultContent));
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

  const decryptData = async (
    encryptedData: ArrayBuffer,
    password: string
  ): Promise<ArrayBuffer> => {
    const passwordBytes = new TextEncoder().encode(password);
    const passwordHash = await crypto.subtle.digest('SHA-256', passwordBytes);

    const key = await crypto.subtle.importKey(
      'raw',
      passwordHash,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const encryptedBytes = new Uint8Array(encryptedData);
    const nonce = encryptedBytes.slice(0, 12);
    const ciphertextAndTag = encryptedBytes.slice(12);

    try {
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: nonce,
        },
        key,
        ciphertextAndTag
      );

      return decrypted;
    } catch (error: unknown) {
      throw new Error(extractError(error));
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
                {/* Display decrypted content as hex */}
                {Buffer.from(decryptedVaultContent).toString('hex')}
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
          {selectedFile && isContinue && (
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
