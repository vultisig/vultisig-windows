import { StrictMode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, QRCode, message, Form, Input } from "antd";
import { formatUnits, toUtf8String } from "ethers";
import { create } from "@bufbuild/protobuf";
import ReactDOM from "react-dom/client";
import html2canvas from "html2canvas";

import { CoinSchema } from "protos/coin_pb";

import {
  chains,
  evmChains,
  explorerUrl,
  TssKeysignType,
} from "utils/constants";
import {
  formatDisplayNumber,
  getTssKeysignType,
  parseMemo,
  splitString,
} from "utils/functions";
import {
  ITransaction,
  ParsedMemo,
  SignatureProps,
  VaultProps,
} from "utils/interfaces";
import {
  getStoredCurrency,
  getStoredLanguage,
  getStoredTransactions,
  getStoredVaults,
  setStoredTransaction,
} from "utils/storage";
import {
  EVMTransactionProvider,
  MayaTransactionProvider,
  TransactionProvider,
  ThorchainTransactionProvider,
  CosmosTransactionProvider,
  BaseTransactionProvider,
} from "utils/transaction-provider";
import i18n from "i18n/config";
import api from "utils/api";
import messageKeys from "utils/message-keys";
import DataConverterProvider from "utils/data-converter-provider";
import WalletCoreProvider from "utils/wallet-core-provider";

import {
  ArrowLeft,
  LinkExternal,
  QRCodeBorder,
  SquareArrow,
  SquareBehindSquare,
} from "icons";
import ConfigProvider from "components/config-provider";
import MiddleTruncate from "components/middle-truncate";
import VultiLoading from "components/vulti-loading";
import VultiError from "components/vulti-error";

import "styles/index.scss";
import "pages/transaction/index.scss";
import "utils/prototypes";
import UTXOTransactionProvider from "utils/transaction-provider/utxo";

interface FormProps {
  password: string;
}

interface InitialState {
  fastSign?: boolean;
  loading?: boolean;
  sendKey?: string;
  step: number;
  transaction?: ITransaction.METAMASK;
  txProvider?: BaseTransactionProvider;
  parsedMemo?: ParsedMemo;
  vault?: VaultProps;
  hasError?: boolean;
  errorTitle?: string;
  errorDescription?: string;
}

const Component = () => {
  const { t } = useTranslation();
  const RETRY_TIMEOUT_MS = 120000;
  const CLOSE_TIMEOUT_MS = 60000;
  const initialState: InitialState = { step: 1, hasError: false };
  const [connectedDevices, setConnectedDevices] = useState(0);
  const [form] = Form.useForm();
  const [state, setState] = useState(initialState);
  const {
    loading,
    fastSign,
    sendKey,
    step,
    transaction,
    txProvider,
    vault,
    hasError,
    errorTitle,
    errorDescription,
    parsedMemo,
  } = state;
  const [messageApi, contextHolder] = message.useMessage();

  const handleApp = (): void => {
    window.open(sendKey, "_self");
  };

  const handleClose = (): void => {
    window.close();
  };

  const handleCopy = (): void => {
    if (transaction?.txHash) {
      navigator.clipboard
        .writeText(transaction.txHash)
        .then(() => {
          messageApi.open({
            type: "success",
            content: t(messageKeys.SUCCESSFUL_COPY_LINK),
          });
        })
        .catch(() => {
          messageApi.open({
            type: "error",
            content: t(messageKeys.UNSUCCESSFUL_COPY_LINK),
          });
        });
    }
  };

  const exportQRCode = () => {
    const qrContainer = document.querySelector(".qrcode") as HTMLElement;

    if (qrContainer) {
      html2canvas(qrContainer, {
        backgroundColor: null,
        logging: false,
        useCORS: true,
      }).then((canvas) => {
        const link = document.createElement("a");
        link.download = "qr-code.jpg";
        link.href = canvas.toDataURL("image/jpeg");
        link.click();
      });
    }
  };

  const initCloseTimer = (timeout: number) => {
    setTimeout(handleClose, timeout);
  };

  const handlePending = (
    preSignedImageHash: string,
    preSignedInputData: Uint8Array
  ): void => {
    if (transaction && txProvider) {
      const retryTimeout = setTimeout(() => {
        setStoredTransaction({ ...transaction, status: "error" }).then(() => {
          setState({
            ...state,
            hasError: true,
            errorTitle: t(messageKeys.TIMEOUT_ERROR),
            errorDescription: t(messageKeys.SIGNING_TIMEOUT_DESCRIPTION),
          });
        });
      }, RETRY_TIMEOUT_MS);

      const attemptTransaction = (): void => {
        api.transaction
          .getComplete(transaction.id, preSignedImageHash)
          .then((data) => {
            clearTimeout(retryTimeout);

            txProvider
              .getSignedTransaction({
                inputData: preSignedInputData,
                signature: data as SignatureProps,
                transaction,
                vault,
              })
              .then(({ txHash, raw }) => {
                setStoredTransaction({
                  ...transaction,
                  status: "success",
                  txHash,
                  raw,
                }).then(() => {
                  setState((prevState) => ({
                    ...prevState,
                    step: 5,
                    transaction: { ...transaction, txHash, raw },
                  }));

                  initCloseTimer(CLOSE_TIMEOUT_MS);
                });
              })
              .catch(() => {});
          })
          .catch(({ status }) => {
            if (status === 404) {
              setTimeout(attemptTransaction, 1000);
            } else {
              clearTimeout(retryTimeout);

              setStoredTransaction({ ...transaction, status: "error" }).then(
                () => {
                  messageApi.open({
                    type: "error",
                    content: t(messageKeys.RETRY_ERROR),
                  });
                }
              );
            }
          });
      };

      attemptTransaction();
    }
  };

  const handleCustomMessagePending = (): void => {
    if (!transaction || !txProvider) return;
    const retryTimeout = setTimeout(() => {
      setStoredTransaction({ ...transaction, status: "error" }).then(() => {
        setState({
          ...state,
          hasError: true,
          errorTitle: t(messageKeys.TIMEOUT_ERROR),
          errorDescription: t(messageKeys.SIGNING_TIMEOUT_DESCRIPTION),
        });
      });
    }, RETRY_TIMEOUT_MS);

    const attemptTransaction = (): void => {
      api.transaction
        .getComplete(transaction.id)
        .then((data) => {
          clearTimeout(retryTimeout);
          const customSignature = txProvider.getEncodedSignature(
            data as SignatureProps
          );
          setStoredTransaction({
            ...transaction,
            status: "success",
            customSignature,
          }).then(() => {
            setState((prevState) => ({
              ...prevState,
              step: 5,
              transaction: {
                ...transaction,
                customSignature,
              },
            }));
            initCloseTimer(CLOSE_TIMEOUT_MS);
          });
        })
        .catch(({ status }) => {
          if (status === 404) {
            setTimeout(() => {
              attemptTransaction();
            }, 1000);
          } else {
            clearTimeout(retryTimeout);
            setStoredTransaction({ ...transaction, status: "error" }).then(
              () => {
                messageApi.open({
                  type: "error",
                  content: t(messageKeys.RETRY_ERROR),
                });
              }
            );
          }
        });
    };
    attemptTransaction();
  };

  const handleStart = (): void => {
    if (transaction && txProvider) {
      api.transaction
        .getDevices(transaction.id)
        .then(({ data }) => {
          setConnectedDevices(data?.length);
          if (data?.length > 1) {
            api.transaction
              .setStart(transaction.id, data)
              .then(() => {
                setStoredTransaction({ ...transaction, status: "pending" })
                  .then(() => {
                    if (transaction.isCustomMessage) {
                      setState((prevState) => ({
                        ...prevState,
                        step: 4,
                      }));
                      handleCustomMessagePending();
                    } else {
                      txProvider
                        .getPreSignedInputData()
                        .then((preSignedInputData) => {
                          txProvider
                            .getPreSignedImageHash(preSignedInputData)
                            .then((preSignedImageHash) => {
                              setState((prevState) => ({
                                ...prevState,
                                step: 4,
                              }));
                              handlePending(
                                preSignedImageHash,
                                preSignedInputData
                              );
                            })
                            .catch((err) => {
                              console.error(err);
                            });
                        })
                        .catch((err) => {
                          console.error(err);
                        });
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              })
              .catch((err) => {
                console.log(err);
              });
          } else {
            setTimeout(() => {
              handleStart();
            }, 1000);
          }
        })
        .catch(() => {
          setStoredTransaction({ ...transaction, status: "error" }).then(() => {
            messageApi.open({
              type: "error",
              content: t(messageKeys.RETRY_ERROR),
            });
          });
        });
    }
  };

  const handleStep = (step: number): void => {
    switch (step) {
      case 2: {
        if (sendKey) {
          setState((prevState) => ({ ...prevState, step }));
        } else if (transaction && txProvider && vault) {
          setState((prevState) => ({ ...prevState, loading: true }));
          if (transaction.isCustomMessage) {
            txProvider
              .getTransactionKey(
                vault.publicKeyEcdsa,
                transaction,
                vault.hexChainCode
              )
              .then((sendKey) => {
                api.fastVault.assertVaultExist(vault.publicKeyEcdsa).then(() => {
                  setState((prevState) => ({
                    ...prevState,
                    fastSign: true,
                    loading: false,
                    sendKey,
                    step,
                  }));

                  handleStart();
                });
              })
              .catch(() => {
                setState((prevState) => ({ ...prevState, loading: false }));
              });
          } else {
            txProvider
              .getKeysignPayload(transaction, vault)
              .then(() => {
                txProvider
                  .getTransactionKey(
                    vault.publicKeyEcdsa,
                    transaction,
                    vault.hexChainCode
                  )
                  .then((sendKey) => {
                    api
                      .fastVault
                      .assertVaultExist(vault.publicKeyEcdsa)
                      .then(() => {
                        setState((prevState) => ({
                          ...prevState,
                          fastSign: true,
                          loading: false,
                          sendKey,
                          step,
                        }));

                        handleStart();
                      });
                  })
                  .catch(() => {
                    setState((prevState) => ({ ...prevState, loading: false }));
                  });
              })
              .catch(() => {
                setState((prevState) => ({ ...prevState, loading: false }));
              });
          }
        }

        break;
      }
      default: {
        setState((prevState) => ({ ...prevState, step }));

        break;
      }
    }
  };
  const handleFastSign = (): void => {
    if (connectedDevices >= 1) handleStep(3);
    else
      messageApi.open({
        type: "warning",
        content: t(messageKeys.SCAN_FIRST),
      });
  };

  const handleSubmitFastSignPassword = (): void => {
    txProvider?.getPreSignedInputData().then((preSignedInputData) => {
      txProvider
        .getPreSignedImageHash(preSignedInputData)
        .then((preSignedImageHash) => {
          if (transaction) {
            const tssType = getTssKeysignType(transaction.chain.name);
            form
              .validateFields()
              .then(({ password }: FormProps) => {
                api.fastVault
                  .signWithServer({
                    vault_password: password,
                    hex_encryption_key: vault?.hexChainCode ?? "",
                    is_ecdsa:
                      getTssKeysignType(transaction.chain.name) ===
                      TssKeysignType.ECDSA,
                    derive_path: txProvider.getDerivePath(
                      transaction.chain.name
                    ),
                    messages: [preSignedImageHash],
                    public_key:
                      tssType === TssKeysignType.ECDSA
                        ? vault?.publicKeyEcdsa ?? ""
                        : vault?.publicKeyEddsa ?? "",
                    session: transaction.id,
                  })
                  .then(() => {
                    setState((prevState) => ({ ...prevState, step: 4 }));
                    handlePending(preSignedImageHash, preSignedInputData);
                  })
                  .catch((err) => {
                    console.error(err);
                    messageApi.open({
                      type: "error",
                      content: t(messageKeys.SIGNING_ERROR),
                    });
                  });
              })
              .catch(() => {});
          }
        });
    });
  };

  const componentDidMount = (): void => {
    Promise.all([
      getStoredCurrency(),
      getStoredLanguage(),
      getStoredTransactions(),
      getStoredVaults(),
    ]).then(([currency, language, transactions, vaults]) => {
      const [transaction] = transactions;

      i18n.changeLanguage(language);

      const vault = vaults.find(
        ({ chains }) =>
          chains.findIndex(
            ({ address }) =>
              address?.toLowerCase() === transaction?.from.toLowerCase()
          ) >= 0
      );

      if (vault) {
        const walletCore = new WalletCoreProvider();

        walletCore
          .getCore()
          .then(({ chainRef, walletCore }) => {
            const dataConverter = new DataConverterProvider();
            const txProvider = TransactionProvider.createProvider(
              transaction.chain.name,
              chainRef,
              dataConverter.compactEncoder,
              walletCore
            );

            // Improve
            if (evmChains.indexOf(transaction.chain.name) >= 0) {
              parseMemo(transaction.data)
                .then((memo) => {
                  setState({ ...state, parsedMemo: memo });
                })
                .catch();

              (txProvider as EVMTransactionProvider).getFeeData().then(() => {
                (txProvider as EVMTransactionProvider)
                  .getEstimateTransactionFee(transaction.chain.cmcId, currency)
                  .then((gasPrice) => {
                    transaction.gasPrice = gasPrice;
                    try {
                      transaction.memo = toUtf8String(transaction.data);
                    } catch (err) {}
                    setStoredTransaction(transaction).then(() => {
                      setState((prevState) => ({
                        ...prevState,
                        currency,
                        loaded: true,
                        transaction,
                        txProvider,
                        vault,
                      }));
                    });
                  });
              });
            } else {
              const coin = create(CoinSchema, {
                chain: transaction.chain.name,
                ticker: transaction.chain.ticker,
                address: transaction.from,
                decimals: transaction.chain.decimals,
                hexPublicKey: vault.hexChainCode,
                isNativeToken: true,
                logo: transaction.chain.ticker.toLowerCase(),
              });

              (
                txProvider as
                  | ThorchainTransactionProvider
                  | MayaTransactionProvider
                  | CosmosTransactionProvider
                  | UTXOTransactionProvider
              )
                .getSpecificTransactionInfo(coin)
                .then((blockchainSpecific) => {
                  transaction.gasPrice =
                    coin.ticker === chains.THORChain.ticker
                      ? String(blockchainSpecific.gasPrice)
                      : formatUnits(blockchainSpecific.gasPrice, coin.decimals);

                  try {
                    transaction.memo = toUtf8String(transaction.data);
                  } catch (err) {
                    if (!parsedMemo) {
                      transaction.memo = transaction.data;
                    }
                  }
                  setStoredTransaction(transaction).then(() => {
                    setState((prevState) => ({
                      ...prevState,
                      currency,
                      loaded: true,
                      transaction,
                      txProvider,
                      vault,
                    }));
                  });
                });
            }
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        setState({
          ...state,
          hasError: true,
          errorTitle: t(messageKeys.GET_VAULT_FAILED),
          errorDescription: t(messageKeys.GET_VAULT_FAILED_DESCRIPTION),
        });
      }
    });
  };

  useEffect(componentDidMount, []);

  return (
    <ConfigProvider>
      <div className={`layout step-${step}`}>
        {hasError ? (
          <VultiError
            onClose={handleClose}
            description={errorDescription ?? ""}
            title={errorTitle ?? ""}
          />
        ) : transaction ? (
          <>
            <div className="header">
              <span className="heading">
                {t(
                  step === 1
                    ? messageKeys.VERIFY_SEND
                    : step === 5
                    ? messageKeys.TRANSACTION_SUCCESSFUL
                    : messageKeys.SIGN_TRANSACTION
                )}
              </span>
              {step === 2 && (
                <ArrowLeft
                  onClick={() => handleStep(1)}
                  className="icon icon-left"
                />
              )}
              {step === 2 && (
                <LinkExternal
                  onClick={() => exportQRCode()}
                  className="icon icon-right"
                />
              )}
              <span
                className="progress"
                style={{ width: `${(100 / 4) * step}%` }}
              />
            </div>
            {step === 1 ? (
              <>
                <div className="content">
                  <span className="divider">
                    {t(messageKeys.TRANSACTION_DETAILS)}
                  </span>
                  {!transaction.isCustomMessage && (
                    <div className="list">
                      <div className="list-item">
                        <span className="label">{t(messageKeys.FROM)}</span>
                        <MiddleTruncate text={transaction.from} />
                      </div>
                      {transaction.to && (
                        <div className="list-item">
                          <span className="label">{t(messageKeys.TO)}</span>
                          <MiddleTruncate text={transaction.to} />
                        </div>
                      )}
                      {transaction.value && (
                        <div className="list-item">
                          <span className="label">{t(messageKeys.AMOUNT)}</span>
                          <span className="extra">{`${formatUnits(
                            transaction.value,
                            transaction.chain.decimals
                          )} ${transaction.chain.ticker}`}</span>
                        </div>
                      )}
                      {transaction.memo && !parsedMemo && (
                        <div className="memo-item">
                          <span className="label">{t(messageKeys.MEMO)}</span>
                          <span className="extra">
                            <div>
                              {splitString(transaction.memo, 32).map(
                                (str, index) => (
                                  <div key={index}>{str}</div>
                                )
                              )}
                            </div>
                          </span>
                        </div>
                      )}
                      <div className="list-item">
                        <span className="label">
                          {t(messageKeys.NETWORK_FEE)}
                        </span>
                        <span className="extra">
                          {formatDisplayNumber(
                            transaction.gasPrice!,
                            transaction.chain.ticker
                          )}
                        </span>
                      </div>
                      {parsedMemo && (
                        <>
                          <div className="list-item">
                            <span className="label">
                              {t(messageKeys.FUNCTION_SIGNATURE)}
                            </span>
                            <div className="scrollable-x">
                              {parsedMemo.signature}
                            </div>
                          </div>
                          <div className="list-item">
                            <span className="label">
                              {t(messageKeys.FUNCTION_INPUTS)}
                            </span>
                            <div className="scrollable-x monospace-text ">
                              <div style={{ width: "max-content" }}>
                                <div className="function-inputs">
                                  {parsedMemo.inputs}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  {transaction.isCustomMessage && (
                    <div className="list">
                      <div className="list-item">
                        <span className="label">{t(messageKeys.ADDRESS)}</span>
                        <MiddleTruncate text={transaction.from} />
                      </div>
                      <div className="list-item">
                        <span className="label">{t(messageKeys.MESSAGE)}</span>
                        <MiddleTruncate
                          text={transaction.customMessage!.message}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="footer">
                  <Button
                    loading={loading}
                    onClick={() => handleStep(2)}
                    type="primary"
                    shape="round"
                    block
                  >
                    {t(messageKeys.SIGN)}
                  </Button>
                </div>
              </>
            ) : step === 2 ? (
              <>
                <div className="content">
                  <span className="hint">
                    {t(messageKeys.SCAN_QR_WITH_DEVICE)}
                  </span>
                  <div className="qrcode">
                    <QRCodeBorder className="border" />
                    <div className="qr-container">
                      <QRCode
                        bordered
                        size={275}
                        value={sendKey || ""}
                        color="white"
                      />
                    </div>
                  </div>
                </div>
                <div className="footer">
                  <Button
                    onClick={handleFastSign}
                    type="primary"
                    shape="round"
                    disabled={!fastSign}
                    block
                  >
                    {t(messageKeys.FAST_SIGN)}
                  </Button>
                  <Button
                    onClick={handleApp}
                    type="default"
                    shape="round"
                    block
                  >
                    {t(messageKeys.OPEN_DESKTOP_APP)}
                  </Button>
                </div>
              </>
            ) : step === 3 ? (
              <>
                <div className="content">
                  <div className="content">
                    <Form form={form}>
                      <Form.Item name="password" rules={[{ required: true }]}>
                        <Input
                          placeholder="FastSign Password"
                          type="password"
                        />
                      </Form.Item>
                      <Button htmlType="submit" />
                    </Form>
                  </div>
                  <div className="footer">
                    <Button
                      onClick={handleSubmitFastSignPassword}
                      type="primary"
                      shape="round"
                      block
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </>
            ) : step === 4 ? (
              <>
                <div className="content">
                  <VultiLoading />
                  <span className="message">{t(messageKeys.SIGNING)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="content">
                  {!transaction.isCustomMessage ? (
                    <div className="list">
                      <div className="list-item">
                        <span className="label">
                          {t(messageKeys.TRANSACTION)}
                        </span>
                        <MiddleTruncate text={transaction.txHash!} />
                        <div className="actions">
                          <a
                            href={`${explorerUrl[transaction.chain.name]}/tx/${
                              transaction.txHash
                            }`}
                            rel="noopener noreferrer"
                            target="_blank"
                            className="btn"
                          >
                            <SquareArrow />
                            {t(messageKeys.VIEW_TX)}
                          </a>
                          <span className="btn" onClick={() => handleCopy()}>
                            <SquareBehindSquare />
                            {t(messageKeys.COPY_TX)}
                          </span>
                        </div>
                      </div>
                      <div className="list-item">
                        <span className="label">{t(messageKeys.TO)}</span>
                        <MiddleTruncate text={transaction.to} />
                      </div>
                      {transaction.value && (
                        <div className="list-item">
                          <span className="label">{t(messageKeys.AMOUNT)}</span>
                          <span className="extra">{`${formatUnits(
                            transaction.value,
                            transaction.chain.decimals
                          )} ${transaction.chain.ticker}`}</span>
                        </div>
                      )}

                      {transaction.memo && !parsedMemo && (
                        <div className="memo-item">
                          <span className="label">{t(messageKeys.MEMO)}</span>
                          <span className="extra">
                            <div>
                              {splitString(transaction.memo, 32).map(
                                (str, index) => (
                                  <div key={index}>{str}</div>
                                )
                              )}
                            </div>
                          </span>
                        </div>
                      )}
                      <div className="list-item">
                        <span className="label">
                          {t(messageKeys.NETWORK_FEE)}
                        </span>
                        <span className="extra">{transaction.gasPrice}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="list">
                      <div className="list-item">
                        <span className="label">
                          {t(messageKeys.SIGNATURE)}
                        </span>
                        <MiddleTruncate text={transaction.customSignature!} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="footer">
                  <Button
                    onClick={handleClose}
                    type="primary"
                    shape="round"
                    block
                  >
                    {t(messageKeys.DONE)}
                  </Button>
                </div>
              </>
            )}

            {contextHolder}
          </>
        ) : (
          <VultiLoading />
        )}
      </div>
    </ConfigProvider>
  );
};

export default Component;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Component />
  </StrictMode>
);
