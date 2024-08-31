import React, { createContext, useContext, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './App.css';
import App from './App';
import { Buffer } from 'buffer';
import { initWasm, WalletCore } from '@trustwallet/wallet-core';
import './extensions/string';
import { shouldBePresent } from './lib/utils/assert/shouldBePresent';

// Make sure Buffer is available globally
window.Buffer = Buffer;

const WalletCoreContext = createContext<WalletCore | null>(null);

export const WalletCoreProvider = ({ children }: { children: any }) => {
  const [wasmModule, setWasmModule] = useState<WalletCore | null>(null);

  useEffect(() => {
    const loadWasm = async () => {
      const walletCore = await initWasm();
      setWasmModule(walletCore);
    };
    loadWasm();
  }, []);

  return (
    <WalletCoreContext.Provider value={wasmModule}>
      {children}
    </WalletCoreContext.Provider>
  );
};

export const useWalletCore = () => useContext(WalletCoreContext);

export const useAsserWalletCore = () => shouldBePresent(useWalletCore());

const container = document.getElementById('root');

const root = createRoot(container!);

root.render(
  //<React.StrictMode>
  <WalletCoreProvider>
    <App />
  </WalletCoreProvider>
  //</React.StrictMode>
);
