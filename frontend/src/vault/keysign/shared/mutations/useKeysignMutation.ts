import { useMutation } from '@tanstack/react-query';

import { Keysign } from '../../../../../wailsjs/go/tss/TssService';
import { getPreSigningHashes } from '../../../../chain/tx/utils/getPreSigningHashes';
import { getCoinType } from '../../../../chain/walletCore/getCoinType';
import { hexEncode } from '../../../../chain/walletCore/hexEncode';
import { getLastItem } from '../../../../lib/utils/array/getLastItem';
import { chainPromises } from '../../../../lib/utils/promise/chainPromises';
import { pick } from '../../../../lib/utils/record/pick';
import { recordFromItems } from '../../../../lib/utils/record/recordFromItems';
import { Chain } from '../../../../model/chain';
import { useAssertWalletCore } from '../../../../providers/WalletCoreProvider';
import { BlockchainServiceFactory } from '../../../../services/Blockchain/BlockchainServiceFactory';
import { RpcServiceFactory } from '../../../../services/Rpc/RpcServiceFactory';
import { useCurrentSessionId } from '../../../keygen/shared/state/currentSessionId';
import { useCurrentServerUrl } from '../../../keygen/state/currentServerUrl';
import { getVaultPublicKey } from '../../../publicKey/getVaultPublicKey';
import { useCurrentHexEncryptionKey } from '../../../setup/state/currentHexEncryptionKey';
import { useCurrentVault } from '../../../state/currentVault';
import { getKeysignChain } from '../../utils/getKeysignChain';
import { getTssKeysignType } from '../../utils/getTssKeysignType';
import { getTxInputData } from '../../utils/getTxInputData';
import { useKeysignPayload } from '../state/keysignPayload';

export const useKeysignMutation = () => {
  const payload = useKeysignPayload();
  const walletCore = useAssertWalletCore();
  const vault = useCurrentVault();
  const sessionId = useCurrentSessionId();
  const encryptionKeyHex = useCurrentHexEncryptionKey();
  const serverUrl = useCurrentServerUrl();

  return useMutation({
    mutationFn: async () => {
      const chain = getKeysignChain(payload);

      const inputs = await getTxInputData({
        keysignPayload: payload,
        walletCore,
      });

      const groupedMsgs = inputs.map(txInputData =>
        getPreSigningHashes({
          txInputData,
          walletCore,
          chain,
        }).map(value =>
          hexEncode({
            value,
            walletCore,
          })
        )
      );

      const msgs = groupedMsgs.flat().sort();

      const blockchainService = BlockchainServiceFactory.createService(
        chain as Chain,
        walletCore
      );

      const tssType = getTssKeysignType(chain);

      const coinType = getCoinType({ walletCore, chain });

      const signatures = await Keysign(
        vault,
        msgs,
        vault.local_party_id,
        walletCore.CoinTypeExt.derivationPath(coinType),
        sessionId,
        encryptionKeyHex,
        serverUrl,
        tssType.toString().toLowerCase()
      );

      const signaturesRecord = recordFromItems(signatures, ({ msg }) =>
        Buffer.from(msg, 'base64').toString('hex')
      );

      const publicKey = await getVaultPublicKey({
        vault,
        chain,
        walletCore,
      });

      const hashes = await chainPromises(
        inputs.map(async (txInputData, index) => {
          const msgs = groupedMsgs[index];

          const { rawTransaction, signature } =
            await blockchainService.getSignedTransaction(
              publicKey,
              txInputData,
              pick(signaturesRecord, msgs)
            );

          const rpcService = RpcServiceFactory.createRpcService(chain);

          // TODO: Transaction broadcasting interface should be redesigned
          // It should receive a typed input instead of a string
          if (chain === Chain.Sui) {
            return rpcService.broadcastTransaction(
              JSON.stringify({
                unsignedTransaction: rawTransaction,
                signature: signature,
              })
            );
          }

          return rpcService.broadcastTransaction(rawTransaction);
        })
      );

      return getLastItem(hashes);
    },
  });
};
