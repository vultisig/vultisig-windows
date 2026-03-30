/**
 * DApp Page Fixture
 *
 * Provides a test DApp with buttons for common Web3 operations:
 * - Connect wallet
 * - Sign message
 * - Send transaction
 * - Switch chain
 *
 * Results are displayed in DOM elements for easy assertion.
 */

import http from 'http'
import { test as base, type Page } from '@playwright/test'

/**
 * Test DApp HTML with interactive buttons and result displays
 */
const TEST_DAPP_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VultiConnect Test DApp</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .section {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 { color: #333; }
    h2 { color: #666; margin-top: 0; }
    button {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      margin: 5px;
    }
    button:hover { background: #4338ca; }
    button:disabled { background: #ccc; cursor: not-allowed; }
    .result {
      margin-top: 15px;
      padding: 15px;
      background: #f0f0f0;
      border-radius: 4px;
      font-family: monospace;
      word-break: break-all;
      min-height: 20px;
    }
    .error { background: #fee; color: #c00; }
    .success { background: #efe; color: #060; }
    #providers { font-size: 14px; }
    .provider-item {
      display: inline-block;
      background: #e0e7ff;
      padding: 4px 8px;
      border-radius: 4px;
      margin: 2px;
    }
  </style>
</head>
<body>
  <h1>🔐 VultiConnect Test DApp</h1>

  <div class="section">
    <h2>Provider Detection</h2>
    <div id="providers"></div>
    <button id="btn-detect" data-testid="detect-providers">Detect Providers</button>
  </div>

  <div class="section">
    <h2>Connect Wallet</h2>
    <button id="btn-connect" data-testid="connect-wallet">Connect</button>
    <button id="btn-disconnect" data-testid="disconnect-wallet" disabled>Disconnect</button>
    <div id="connect-result" class="result" data-testid="connect-result"></div>
  </div>

  <div class="section">
    <h2>Sign Message</h2>
    <input type="text" id="message-input" value="Hello, Vultisig!" placeholder="Message to sign" style="padding: 10px; width: 300px; margin-right: 10px;">
    <button id="btn-sign" data-testid="sign-message" disabled>Sign Message</button>
    <div id="sign-result" class="result" data-testid="sign-result"></div>
  </div>

  <div class="section">
    <h2>Send Transaction</h2>
    <input type="text" id="tx-to" placeholder="To address" style="padding: 10px; width: 300px; display: block; margin-bottom: 10px;">
    <input type="text" id="tx-value" placeholder="Value (ETH)" value="0.001" style="padding: 10px; width: 150px; margin-right: 10px;">
    <button id="btn-send" data-testid="send-transaction" disabled>Send Transaction</button>
    <div id="send-result" class="result" data-testid="send-result"></div>
  </div>

  <div class="section">
    <h2>Switch Chain</h2>
    <select id="chain-select" style="padding: 10px; margin-right: 10px;">
      <option value="0x1">Ethereum (1)</option>
      <option value="0x89">Polygon (137)</option>
      <option value="0xa4b1">Arbitrum (42161)</option>
      <option value="0xa">Optimism (10)</option>
      <option value="0x38">BSC (56)</option>
      <option value="0x2105">Base (8453)</option>
    </select>
    <button id="btn-switch" data-testid="switch-chain" disabled>Switch Chain</button>
    <div id="switch-result" class="result" data-testid="switch-result"></div>
  </div>

  <div class="section">
    <h2>Events Log</h2>
    <button id="btn-clear-log" data-testid="clear-log">Clear Log</button>
    <div id="events-log" class="result" data-testid="events-log" style="max-height: 200px; overflow-y: auto;"></div>
  </div>

  <script>
    // State
    let connectedAddress = null;
    let currentChainId = null;

    // DOM elements
    const btnDetect = document.getElementById('btn-detect');
    const btnConnect = document.getElementById('btn-connect');
    const btnDisconnect = document.getElementById('btn-disconnect');
    const btnSign = document.getElementById('btn-sign');
    const btnSend = document.getElementById('btn-send');
    const btnSwitch = document.getElementById('btn-switch');
    const btnClearLog = document.getElementById('btn-clear-log');

    const providersDiv = document.getElementById('providers');
    const connectResult = document.getElementById('connect-result');
    const signResult = document.getElementById('sign-result');
    const sendResult = document.getElementById('send-result');
    const switchResult = document.getElementById('switch-result');
    const eventsLog = document.getElementById('events-log');

    // Helper to log events
    function logEvent(type, data) {
      const timestamp = new Date().toLocaleTimeString();
      const entry = document.createElement('div');
      entry.textContent = \`[\${timestamp}] \${type}: \${JSON.stringify(data)}\`;
      eventsLog.insertBefore(entry, eventsLog.firstChild);
    }

    // Detect providers
    btnDetect.onclick = () => {
      const providers = [];
      if (window.ethereum) providers.push('window.ethereum');
      if (window.vultisig) providers.push('window.vultisig');
      if (window.phantom?.solana) providers.push('window.phantom.solana');
      if (window.phantom?.ethereum) providers.push('window.phantom.ethereum');

      providersDiv.innerHTML = providers.length
        ? providers.map(p => '<span class="provider-item">' + p + '</span>').join('')
        : 'No providers detected';

      logEvent('providers', providers);
    };

    // Auto-detect on load
    setTimeout(() => btnDetect.click(), 500);

    // Connect wallet
    btnConnect.onclick = async () => {
      connectResult.className = 'result';
      connectResult.textContent = 'Connecting...';

      try {
        if (!window.ethereum) throw new Error('No ethereum provider');

        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });

        connectedAddress = accounts[0];
        currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

        connectResult.className = 'result success';
        connectResult.textContent = 'Connected: ' + connectedAddress + ' (Chain: ' + currentChainId + ')';

        btnConnect.disabled = true;
        btnDisconnect.disabled = false;
        btnSign.disabled = false;
        btnSend.disabled = false;
        btnSwitch.disabled = false;

        logEvent('connected', { address: connectedAddress, chainId: currentChainId });
      } catch (err) {
        connectResult.className = 'result error';
        connectResult.textContent = 'Error: ' + (err.message || err.code || err);
        logEvent('connect-error', { error: err.message, code: err.code });
      }
    };

    // Disconnect
    btnDisconnect.onclick = () => {
      connectedAddress = null;
      currentChainId = null;
      connectResult.className = 'result';
      connectResult.textContent = 'Disconnected';

      btnConnect.disabled = false;
      btnDisconnect.disabled = true;
      btnSign.disabled = true;
      btnSend.disabled = true;
      btnSwitch.disabled = true;

      logEvent('disconnected', {});
    };

    // Sign message
    btnSign.onclick = async () => {
      signResult.className = 'result';
      signResult.textContent = 'Signing...';

      try {
        const message = document.getElementById('message-input').value;
        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, connectedAddress]
        });

        signResult.className = 'result success';
        signResult.textContent = 'Signature: ' + signature;
        logEvent('signed', { message, signature: signature.slice(0, 20) + '...' });
      } catch (err) {
        signResult.className = 'result error';
        signResult.textContent = 'Error: ' + (err.message || err.code || err);
        logEvent('sign-error', { error: err.message, code: err.code });
      }
    };

    // Send transaction
    btnSend.onclick = async () => {
      sendResult.className = 'result';
      sendResult.textContent = 'Sending...';

      try {
        const to = document.getElementById('tx-to').value || connectedAddress;
        const value = document.getElementById('tx-value').value || '0.001';
        const valueHex = '0x' + (parseFloat(value) * 1e18).toString(16);

        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: connectedAddress,
            to: to,
            value: valueHex,
            gas: '0x5208' // 21000
          }]
        });

        sendResult.className = 'result success';
        sendResult.textContent = 'TX Hash: ' + txHash;
        logEvent('tx-sent', { hash: txHash });
      } catch (err) {
        sendResult.className = 'result error';
        sendResult.textContent = 'Error: ' + (err.message || err.code || err);
        logEvent('tx-error', { error: err.message, code: err.code });
      }
    };

    // Switch chain
    btnSwitch.onclick = async () => {
      switchResult.className = 'result';
      switchResult.textContent = 'Switching...';

      try {
        const chainId = document.getElementById('chain-select').value;

        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }]
        });

        currentChainId = chainId;
        switchResult.className = 'result success';
        switchResult.textContent = 'Switched to chain: ' + chainId;
        logEvent('chain-switched', { chainId });
      } catch (err) {
        switchResult.className = 'result error';
        switchResult.textContent = 'Error: ' + (err.message || err.code || err);
        logEvent('switch-error', { error: err.message, code: err.code });
      }
    };

    // Clear log
    btnClearLog.onclick = () => {
      eventsLog.innerHTML = '';
    };

    // Listen for events
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        connectedAddress = accounts[0] || null;
        logEvent('accountsChanged', accounts);
        connectResult.textContent = accounts[0]
          ? 'Account: ' + accounts[0]
          : 'Disconnected (no accounts)';
      });

      window.ethereum.on('chainChanged', (chainId) => {
        currentChainId = chainId;
        logEvent('chainChanged', { chainId });
        switchResult.textContent = 'Chain changed: ' + chainId;
      });

      window.ethereum.on('connect', (info) => {
        logEvent('connect', info);
      });

      window.ethereum.on('disconnect', (error) => {
        logEvent('disconnect', error);
      });
    }
  </script>
</body>
</html>
`;

export interface DAppFixtures {
  /** URL of the test DApp server */
  testDappUrl: string
  /** Navigate to DApp and wait for provider injection */
  dappPage: Page
}

/**
 * Create a DApp fixture for testing provider injection
 */
export const dappFixture = base.extend<DAppFixtures>({
  // Test DApp server URL
  // eslint-disable-next-line no-empty-pattern
  testDappUrl: async ({}, use) => {
    // Create HTTP server
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(TEST_DAPP_HTML)
    })

    // Start server on random port
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve())
    })

    const addr = server.address()
    const port = typeof addr === 'object' && addr ? addr.port : 0
    const url = `http://127.0.0.1:${port}`

    await use(url)

    // Cleanup
    server.close()
  },

  // DApp page with provider injected
  dappPage: async ({ context, testDappUrl }, use) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)
    await page.waitForLoadState('domcontentloaded')

    // Wait for provider injection (extension content script)
    await page.waitForFunction(
      () => !!window.ethereum,
      null,
      { timeout: 10_000 }
    )

    await use(page)

    await page.close()
  },
})

export { TEST_DAPP_HTML }
