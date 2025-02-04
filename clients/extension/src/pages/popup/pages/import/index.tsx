import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Upload, UploadProps } from "antd";
import { ReaderOptions, readBarcodesFromImageFile } from "zxing-wasm";
import { UAParser } from "ua-parser-js";

import { calculateWindowPosition, toCamelCase } from "../../../../utils/functions";
import { ChainKey, chains, errorKey } from "../../../../utils/constants";
import { getStoredVaults, setStoredVaults } from "../../../../utils/storage";
import { VaultProps } from "../../../../utils/interfaces";
import useGoBack from "../../../../hooks/go-back";
import AddressProvider from "../../../../utils/address-provider";
import messageKeys from "../../../../utils/message-keys";
import routeKeys from "../../../../utils/route-keys";
import WalletCoreProvider from "../../../../utils/wallet-core-provider";

import { ArrowLeft, CloseLG } from "../../../../icons";

interface InitialState {
  file?: File;
  isWindows: boolean;
  loading?: boolean;
  status: "default" | "error" | "success";
  vault?: VaultProps;
}

const Component = () => {
  const { t } = useTranslation();
  const initialState: InitialState = { isWindows: true, status: "default" };
  const [state, setState] = useState(initialState);
  const { file, isWindows, loading, status, vault } = state;
  const location = useLocation();
  const navigate = useNavigate();
  const goBack = useGoBack();
  const walletCore = new WalletCoreProvider();
  const isPopup = new URLSearchParams(window.location.search).get("isPopup");

  const handleFinish = (): void => {
    if (isPopup) window.close();
    else navigate(routeKeys.main, { state: true });
  };

  const handleStart = (): void => {
    if (!loading && vault && status === "success") {
      getStoredVaults().then((vaults) => {
        const existed = vaults.findIndex(({ uid }) => uid === vault.uid) >= 0;

        setState((prevState) => ({ ...prevState, loading: true }));

        if (existed) {
          const modifiedVaults = vaults.map((item) => ({
            ...item,
            active: item.uid === vault.uid,
          }));

          setStoredVaults(modifiedVaults).then(() => {
            setState((prevState) => ({ ...prevState, loading: false }));

            handleFinish();
          });
        } else {
          walletCore
            .getCore()
            .then(({ chainRef, walletCore }) => {
              const addressProvider = new AddressProvider(chainRef, walletCore);

              const promises = Object.keys(chains).map((key) =>
                addressProvider.getAddress(key as ChainKey, vault)
              );

              Promise.all(promises).then((props) => {
                vault.chains = Object.values(chains).map((chain, index) => ({
                  ...chain,
                  ...props[index],
                }));

                const modifiedVaults = [
                  { ...vault, active: true },
                  ...vaults
                    .filter(({ uid }) => uid !== vault.uid)
                    .map((vault) => ({ ...vault, active: false })),
                ];

                setStoredVaults(modifiedVaults).then(() => {
                  setState((prevState) => ({ ...prevState, loading: false }));

                  handleFinish();
                });
              });
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    }
  };

  const handleClear = (): void => {
    setState(initialState);
  };

  const handleError = (error: string) => {
    setState((prevState) => ({ ...prevState, status: "error" }));

    switch (error) {
      case errorKey.INVALID_EXTENSION:
        console.error("Invalid file extension");
        break;
      case errorKey.INVALID_FILE:
        console.error("Invalid file");
        break;
      case errorKey.INVALID_QRCODE:
        console.error("Invalid qr code");
        break;
      case errorKey.INVALID_VAULT:
        console.error("Invalid vault data");
        break;
      default:
        console.error("Someting is wrong");
        break;
    }
  };

  const handleUpload = (file: File): false => {
    setState(initialState);

    const reader = new FileReader();

    const imageFormats: string[] = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/bmp",
    ];

    reader.onload = () => {
      const readerOptions: ReaderOptions = {
        tryHarder: true,
        formats: ["QRCode"],
        maxNumberOfSymbols: 1,
      };

      setState((prevState) => ({ ...prevState, file }));

      readBarcodesFromImageFile(file, readerOptions)
        .then(([result]) => {
          if (result) {
            try {
              const vault: VaultProps = JSON.parse(result.text);

              setState((prevState) => ({
                ...prevState,
                vault: {
                  ...toCamelCase(vault),
                  apps: [],
                  chains: [],
                  transactions: [],
                },
                status: "success",
              }));
            } catch {
              handleError(errorKey.INVALID_VAULT);
            }
          }
        })
        .catch(() => {
          handleError(errorKey.INVALID_QRCODE);
        });
    };

    reader.onerror = () => {
      handleError(errorKey.INVALID_FILE);
    };

    if (imageFormats.indexOf(file.type) >= 0) {
      reader.readAsDataURL(file);
    } else {
      handleError(errorKey.INVALID_EXTENSION);
    }

    return false;
  };

  const componentDidMount = (): void => {
    const parser = new UAParser();
    const parserResult = parser.getResult();

    if (!isPopup && parserResult.os.name !== "Windows") {
      setState({ ...state, isWindows: false });

      chrome.windows.getCurrent({ populate: true }, (currentWindow) => {
        let createdWindowId: number;
        const { height, left, top, width } =
          calculateWindowPosition(currentWindow);

        chrome.windows.create(
          {
            url: chrome.runtime.getURL("import.html?isPopup=true"),
            type: "panel",
            height,
            left,
            top,
            width,
          },
          (window) => {
            if (window?.id) createdWindowId = window.id;
          }
        );

        chrome.windows.onRemoved.addListener((closedWindowId) => {
          if (closedWindowId === createdWindowId) {
            getStoredVaults().then((vaults) => {
              const active = vaults.find(({ active }) => active);

              if (active) handleFinish();
            });
          }
        });
      });
    }
  };

  useEffect(componentDidMount, []);

  const props: UploadProps = {
    multiple: false,
    showUploadList: false,
    beforeUpload: handleUpload,
    fileList: [],
  };

  return isWindows ? (
    <div className="layout import-page">
      <div className="header">
        <span className="heading">{t(messageKeys.IMPORT_VAULT)}</span>
        {location.state && (
          <ArrowLeft
            className="icon icon-left"
            onClick={() => goBack(routeKeys.main)}
          />
        )}
      </div>
      <div className="content">
        <Upload.Dragger {...props} className={status}>
          <div className="state state-default">
            <img src="/images/qr-code.png" className="icon" />
            <span className="title">{t(messageKeys.ADD_VAULT_QRCODE)}</span>
            <span className="desc">
              {t(messageKeys.DROP_FILE_HERE_OR)}{" "}
              <u>{t(messageKeys.UPLOAD_IT)}</u>
            </span>
          </div>
          <div className="state state-hover">
            <img src="/images/upload.png" className="icon" />
            <span className="title">{t(messageKeys.DROP_FILE_HERE)}</span>
          </div>
          <div className="state state-done">
            <span className="msg">
              {status === "error"
                ? t(messageKeys.IMPORT_FAILED)
                : t(messageKeys.IMPORT_SUCCESSED)}
            </span>
            <img
              src={
                status === "error"
                  ? "/images/qr-error.png"
                  : "/images/qr-success.png"
              }
              className="image"
            />
            {(file as File)?.name && (
              <span className="name">{(file as File).name}</span>
            )}
          </div>
        </Upload.Dragger>

        {status !== "default" && (
          <CloseLG className="clear" onClick={handleClear} />
        )}

        <span className="hint">{t(messageKeys.FIND_YOUR_QRCODE)}</span>
      </div>
      <div className="footer">
        <Button
          shape="round"
          type="primary"
          disabled={status !== "success"}
          loading={loading}
          onClick={handleStart}
          block
        >
          {t(messageKeys.IMPORT_VAULT)}
        </Button>
      </div>
    </div>
  ) : (
    <div className="layout import-page">
      <div className="content">
        <div className="hint">{t(messageKeys.CONTINE_IN_NEW_WINDOW)}</div>
      </div>
    </div>
  );
};

export default Component;
