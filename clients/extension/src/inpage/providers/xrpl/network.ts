/**
 * We only ever derive XRPL mainnet accounts, so the network answer is constant.
 * `websocket` is the public mainnet cluster the GemWallet SDK's own constants
 * point at — dApps read it back to open their own `xrpl.js` client.
 */
export const xrplMainnet = {
  chain: 'XRPL',
  network: 'Mainnet',
  websocket: 'wss://xrplcluster.com',
} as const
