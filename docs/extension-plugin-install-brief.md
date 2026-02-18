# Plugin Marketplace + Extension Flow Brief

## Scope
- Reviewed code paths only in:
  - `plugin-marketplace` (current `main`)
  - `vultisig-windows/clients/extension`
  - shared `vultisig-windows/core` used by extension
- Excluded desktop-agent implementation paths.
- Objective: describe the **actual runtime flow** for:
  1. Sign in to Plugin Marketplace
  2. Install a plugin

## Components involved
- Marketplace web app (React): `plugin-marketplace/src/*`
- Extension inpage provider: `clients/extension/src/inpage/*`
- Extension popup resolvers + auth bridge: `core/inpage-provider/*`
- MPC/plugin install flow: `core/ui/mpc/keygen/reshare/plugin/*`

## 1) Sign-in flow (Plugin Marketplace)

### 1. User action and entrypoint
- User clicks `Connect`/`Connect Vault` in marketplace UI:
  - `plugin-marketplace/src/layouts/Default.tsx`
  - `plugin-marketplace/src/pages/App.tsx`
- This calls `connect()` in `plugin-marketplace/src/providers/Core.tsx`.

### 2. Request extension account
- Marketplace calls `connectToExtension()` -> `eth_requestAccounts` with `preselectFastVault: true`:
  - `plugin-marketplace/src/utils/extension.ts` (`connect`)

### 3. Extension account authorization
- Extension handles `eth_requestAccounts` via:
  - `clients/extension/src/inpage/providers/ethereum/resolvers/eth_requestAccounts.ts`
  - `clients/extension/src/inpage/providers/core/requestAccount.ts`
- `requestAccount` logic:
  1. try `callBackground({ getAccount })`
  2. if unauthorized, open popup `grantVaultAccess`
  3. on success, retry `getAccount`
- `grantVaultAccess` popup stores a host-scoped app session and current vault:
  - `core/inpage-provider/popup/view/resolvers/grantVaultAccess/index.tsx`

### 4. Fetch vault details from extension
- Marketplace calls `window.vultisig.getVault()`:
  - `plugin-marketplace/src/utils/extension.ts` (`getVault`)
- Injected provider mapping:
  - `clients/extension/src/inpage/utils/windowInjector.ts`
  - `getVault -> callBackground({ exportVault: {} })`
- Marketplace validates vault requirements:
  - fast vault only (`isFastVault`), plus `hexChainCode` and `publicKeyEcdsa`.

### 5. Marketplace local vault/session state
- Marketplace hydrates a `Vultisig` memory vault object and checks local token by `publicKeyEcdsa`:
  - `plugin-marketplace/src/providers/Core.tsx`

### 6. Authentication branch
- If token exists for this vault public key:
  - set `vaultId` + connected state.
- If token does not exist:
  1. build connect message (`nonce`, `expiresAt`, `address`)
  2. call extension `personal_sign` with type `connect`
  3. call store API `/auth` (`getAuthToken`)
  4. persist `{accessToken, refreshToken}` by vault public key
- Files:
  - `plugin-marketplace/src/providers/Core.tsx`
  - `plugin-marketplace/src/utils/extension.ts` (`personalSign`)
  - `plugin-marketplace/src/api/store.ts` (`getAuthToken`)
  - `plugin-marketplace/src/storage/token.ts`, `src/storage/vaultId.ts`

### 7. Authenticated API behavior
- Marketplace API client attaches bearer token and auto-refreshes expired tokens using `/auth/refresh`:
  - `plugin-marketplace/src/api/client.ts`
- 401 triggers configured unauthorized handler (`clear`), which disconnects and clears local auth state.

## 2) Plugin install flow

### 1. User action and install entrypoint
- Install button in app page or fee modal calls:
  - `startReshareSession(pluginId, vault.data)`
- Files:
  - `plugin-marketplace/src/pages/App.tsx`
  - `plugin-marketplace/src/components/PaymentModal.tsx`
  - `plugin-marketplace/src/utils/extension.ts` (`startReshareSession`)

### 2. Marketplace prepares install session
Inside `startReshareSession`:
1. choose `extensionParty` from vault signers (first non-server signer)
2. generate:
   - `dAppSessionId` (UUID)
   - `encryptionKeyHex` (32-byte hex)
3. seed router session:
   - `POST {vultiApiUrl}/router/{dAppSessionId}` with `[extensionParty]`

### 3. Marketplace starts extension-side install
- Calls extension plugin RPC:
  - `window.vultisig.plugin.request({ method: "reshare_sign", params: [{ id, dAppSessionId, encryptionKeyHex }] })`
- In extension, `reshare_sign` maps to popup `pluginReshare`:
  - `clients/extension/src/inpage/providers/plugin.ts`

### 4. Extension auth gate for pluginReshare
- `pluginReshare` is an authorized popup method:
  - `core/inpage-provider/popup/interface.ts`
- Bridge enforces authorization before popup execution:
  - `core/inpage-provider/bridge/background.ts`
- Authorization requires host app-session for resolved vault:
  - `core/inpage-provider/background/core/authorization.ts`

### 5. Popup pluginReshare resolver
- Resolver loads developer options (`pluginMarketplaceBaseUrl`, `appInstallTimeout`), then fetches plugin data:
  - `core/inpage-provider/popup/view/resolvers/pluginReshare/index.tsx`
  - `core/inpage-provider/popup/view/resolvers/pluginReshare/PluginInfo.tsx`
  - `core/ui/plugins/core/get.ts`
- It injects external values from marketplace into reshare providers:
  - external session id = `dAppSessionId`
  - external encryption key = `encryptionKeyHex`

### 6. Extension plugin installation MPC flow
- Flow composition:
  - confirm plugin/permissions + collect password
  - run fast server reshare bootstrap with `reshare_type: 1`
  - wait for peers and then run keygen flow
- Files:
  - `core/ui/mpc/keygen/reshare/plugin/PluginReshareFlowContent.tsx`
  - `core/ui/mpc/keygen/reshare/PluginReshareFastKeygenServerActionProvider.tsx`
  - `core/ui/mpc/keygen/reshare/plugin/WaitForPluginAndVerifier.tsx`

Peer readiness condition for advancing:
- server present (`hasServer`)
- verifier peer present (`startsWith('verifier')`)
- plugin peer present (regex match)
- `peers.length >= 3` (`pluginPeersConfig.minimumJoinedParties`)

### 7. Session start and keygen completion
- Extension starts MPC session:
  - `SilentStartMpcSessionFlow` -> `useStartMpcSession` -> `startMpcSession`
- Keygen flow runs in plugin reshare mode and completes via `onFinish(true)` back to popup caller.

### 8. Marketplace parallel router polling + backend finalize
In parallel with extension flow, marketplace polls router:
- `GET {vultiApiUrl}/router/{dAppSessionId}`
- success gate: `peers.length > 1`
- max attempts: 100, interval: 200ms

After race gates pass, marketplace finalizes install:
- `POST /vault/reshare` with:
  - `pluginId`, `sessionId`, `hexEncryptionKey`
  - vault identity fields (`hexChainCode`, `localPartyId`, `publicKey`, `name`, `oldParties`)
- Then waits for extension promise result (`success`) and returns boolean.

Files:
- `plugin-marketplace/src/utils/extension.ts`
- `plugin-marketplace/src/api/store.ts` (`reshareVault`)

## 3) Result propagation
- On success, marketplace marks app installed and shows success modal:
  - `plugin-marketplace/src/pages/App.tsx`
- Installed-state checks use:
  - `GET /vault/exist/{pluginId}/{vaultId}` in `plugin-marketplace/src/api/store.ts`

## Minimal sequence summary
1. `eth_requestAccounts` (extension may open `grantVaultAccess`)  
2. `getVault` + local vault hydration  
3. `personal_sign(connect)` + `/auth` token (if needed)  
4. user clicks install -> `startReshareSession`  
5. marketplace seeds router and calls `reshare_sign`  
6. extension opens authorized `pluginReshare` popup  
7. popup runs plugin reshare MPC flow (server/verifier/plugin peers + keygen)  
8. marketplace posts `/vault/reshare` and awaits extension success  
9. marketplace marks installed and uses `/vault/exist` for status checks
