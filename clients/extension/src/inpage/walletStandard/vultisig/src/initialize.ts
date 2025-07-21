import { registerWallet } from './register.js';
import { VultisigWallet } from './wallet.js';
import type { Vultisig } from './window.js';

export function initialize(vultisig: Vultisig): void {
    registerWallet(new VultisigWallet(vultisig));
}
