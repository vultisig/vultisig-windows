import { Buffer } from 'buffer';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ImportVaultDialog from '../../components/dialog/ImportVaultDialog';
import NavBar from '../../components/navbar/NavBar';
import { VaultContainer } from '../../gen/vultisig/vault/v1/vault_container_pb';
import { Vault } from '../../gen/vultisig/vault/v1/vault_pb';
import { extractErrorMsg } from '../../lib/utils/error/extractErrorMsg';
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate';
import { isBase64Encoded } from '../../utils/util';
import { decryptVault } from '../../vault/encryption/decryptVault';
import { useSaveVaultMutation } from '../../vault/mutations/useSaveVaultMutation';
import { useVaultsQuery } from '../../vault/queries/useVaultsQuery';
import { toStorageVault } from '../../vault/utils/storageVault';
import {
  BackupVault,
  mapBackupVaultToVault,
} from './utils/mapBackupVaultToVault';

const ImportVaultView = () => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
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
  const { data: vaults = [] } = useVaultsQuery();

  const handleUpload = () => {
    const fileInput = document.getElementById('file_upload');
    if (fileInput) {
      fileInput.click();
    }
  };

  const { mutateAsync: saveVault, isPending } = useSaveVaultMutation();

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
        const uint8Array = new Uint8Array(buffer);

        try {
          // Try to decode as UTF-8 string and see if an error is thrown - if not then the vault is not encrypted
          new TextDecoder('utf-8', { fatal: true }).decode(uint8Array);
          setDecryptedVaultContent(uint8Array);
          setContinue(true);
        } catch {
          // Decoding failed, assume encrypted
          setEncryptedVaultContent(buffer);
          setDialogTitle(t('enter_password'));
          setDialogContent('');
          setDialogOpen(true);
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

  const handleOk = async (password: string) => {
    if (!encryptedVaultContent) return;

    try {
      let decryptedVault: ArrayBuffer;
      if (fileExtension === 'dat') {
        decryptedVault = await decryptData(encryptedVaultContent, password);
        const decryptedString = new TextDecoder('utf-8').decode(decryptedVault);
        const hexDecodedData = Buffer.from(decryptedString, 'hex');

        setDecryptedVaultContent(new Uint8Array(hexDecodedData));
      } else {
        const decryptedBuffer = decryptVault({
          password,
          vault: Buffer.from(encryptedVaultContent),
        });
        setDecryptedVaultContent(new Uint8Array(decryptedBuffer));
      }

      setContinue(true);
      setDialogOpen(false);
    } catch (e) {
      setDialogTitle(t('backup_decryption_failed_title'));
      setDialogContent(t('backup_decryption_failed'));
      setTimeout(() => {
        setDialogOpen(true);
      }, 0);
      console.log('Error in handleOk', e);
    }
  };

  const handleContinue = async () => {
    if (!decryptedVaultContent) return;

    try {
      let vault: Vault;
      const utf8String = new TextDecoder('utf-8').decode(decryptedVaultContent);

      if (fileExtension === 'dat') {
        try {
          const cleanedData = utf8String.trim();
          let backupVault;

          try {
            backupVault = JSON.parse(cleanedData);
          } catch {
            const hexDecoded = Buffer.from(cleanedData, 'hex').toString('utf8');
            backupVault = JSON.parse(hexDecoded);
          }

          vault = mapBackupVaultToVault(backupVault as BackupVault);
        } catch (e) {
          setDialogTitle(t('invalid_vault_data'));
          setDialogContent(t('invalid_vault_data_message'));
          setDialogOpen(true);
          console.error('Failed to parse decrypted content as JSON:', e);
          return;
        }
      } else {
        vault = Vault.fromBinary(
          decryptedVaultContent as unknown as Uint8Array
        );
      }

      if (vaults.some(v => v.public_key_ecdsa === vault.publicKeyEcdsa)) {
        setDialogTitle(t('vault_already_exists'));
        setDialogContent(t('vault_already_exists_message'));
        setDialogOpen(true);
        return;
      }

      const getVaultBuffer = () => {
        if (fileExtension === 'dat') {
          const vaultBinary = vault.toBinary();
          return Buffer.from(vaultBinary);
        }
        return Buffer.from(decryptedVaultContent as Uint8Array);
      };

      const newVault = Vault.fromBinary(getVaultBuffer());

      await saveVault(toStorageVault(newVault));

      navigate('vault');
    } catch (e: unknown) {
      setDialogTitle(t('invalid_vault_data'));
      setDialogContent(t('invalid_vault_data_message'));
      setDialogOpen(true);
      console.error('Error in handleContinue function', e);
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
      throw new Error(extractErrorMsg(error));
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
            disabled={!isContinue || isPending}
            onClick={handleContinue}
          >
            {isPending ? t('loading') : t('continue')}
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
