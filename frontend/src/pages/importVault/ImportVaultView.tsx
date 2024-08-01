import React, { useRef, useState } from "react";
import ImportVaultDialog from "../../components/dialog/ImportVaultDialog";
import { useTranslation } from "react-i18next";
import {
  decryptVault,
  isBase64Encoded,
  stringToUint8Array,
  uint8ArrayToBase64,
} from "../../utils/util";
import { VaultContainer } from "../../gen/vultisig/vault/v1/vault_container_pb";
import { Vault } from "../../gen/vultisig/vault/v1/vault_pb";
import { SaveVault } from "../../../wailsjs/go/storage/Store";

const ImportVaultView: React.FC = () => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [isContinue, setContinue] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogContent, setDialogContent] = useState("");
  const [decryptedContent, setDecryptedContent] = useState<Uint8Array | null>();

  const handleUpload = () => {
    const fileInput = document.getElementById("file_upload");
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      if (!event.target.files[0].name.endsWith(".bak")) {
        setDialogTitle(t("invalid_file_format"));
        setDialogContent(t("invalid_file_format_message"));
        setDialogOpen(true);
      } else {
        setSelectedFile(event.target.files[0]);
        const reader = new FileReader();
        reader.onload = () => {
          const data = reader.result;
          setFileContent("");
          setContinue(false);
          if (data && isBase64Encoded(data.toString())) {
            setFileContent(data.toString());
            const decodedData = uint8ArrayToBase64(
              stringToUint8Array(data.toString())
            );
            const vaultContainer = VaultContainer.fromBinary(
              stringToUint8Array(decodedData)
            );
            if (isBase64Encoded(vaultContainer.vault)) {
              const decodedVault = uint8ArrayToBase64(
                stringToUint8Array(vaultContainer.vault.toString())
              );
              setDecryptedContent(stringToUint8Array(decodedVault));
              if (vaultContainer.isEncrypted) {
                setDialogTitle(t("enter_password"));
                setDialogContent("");
                setDialogOpen(true);
              }
            }
          }
        };
        reader.readAsText(event.target.files[0]);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setFileContent("");
    setContinue(false);
  };

  const handleCloseDialog = () => setDialogOpen(false);

  const handleOk = (passwd: string) => {
    if (decryptedContent) {
      decryptVault(passwd, decryptedContent).then((decrptedVault) => {
        if (decrptedVault) {
          setContinue(true);
        }
      });
      return;
    }
    setFileContent("");
    setDialogTitle(t("incorrect_password"));
    setDialogContent(t("backup_decryption_failed"));
    setTimeout(() => {
      setDialogOpen(true);
    }, 0);
  };

  const handleContinue = () => {
    if (decryptedContent) {
      const vault = Vault.fromBinary(decryptedContent);
      console.log("vault", vault);
      SaveVault({
        id: "",
        name: vault.name,
        public_key_ecdsa: vault.publicKeyEcdsa,
        public_key_eddsa: vault.publicKeyEddsa,
        signers: vault.signers,
        created_at: vault.createdAt,
        hex_chain_code: vault.hexChainCode,
        keyshares: vault.keyShares.map((share) => ({
          public_key: share.publicKey,
          keyshare: share.keyshare,
        })),
        local_party_id: vault.localPartyId,
        reshare_prefix: vault.resharePrefix,
        order: 0,
        is_backed_up: true,
        coins: [],
        convertValues: () => {},
      }).then((vaultId: string) => {
        console.log("vaultId", vaultId);
      });
    }
  };

  return (
    <>
      <input
        id="file_upload"
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="text-white pt-[10vh]">
        <div className="text-center px-20">
          <h6 className="text-lg mb-8">{t("enter_previous_vault")}</h6>
          <div
            className="w-full bg-[#33E6BF]/[.14] h-[250px] border-2 border-dashed border-[#33E6BF] rounded-lg font-bold cursor-pointer"
            onClick={handleUpload}
          >
            <img
              src="/assets/images/file.svg"
              className="mx-auto mb-4 mt-20"
              alt="file"
            />
            {t("upload_backup_file")}
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
                src="/assets/images/cancel.svg"
                className="mr-4 w-4"
                alt="cancel"
                onClick={handleCancel}
              />
            </div>
          )}
          <button
            className={`text-lg rounded-full w-full font-bold py-2 mt-48 ${
              isContinue
                ? "text-[#061B3A] bg-[#33E6BF]"
                : "text-[#BDBDBD] bg-white/[.10]"
            }`}
            disabled={!isContinue}
            onClick={handleContinue}
          >
            {t("continue")}
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
