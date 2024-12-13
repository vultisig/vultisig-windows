import { useQuery } from '@tanstack/react-query';

//import { getErc20ApprovePreSignedImageHash } from '../../../../chain/evm/tx/getErc20ApprovePreSignedImageHash';
import { Chain } from '../../../../model/chain';
import { useAssertWalletCore } from '../../../../providers/WalletCoreProvider';
import { BlockchainServiceFactory } from '../../../../services/Blockchain/BlockchainServiceFactory';
import { useKeysignPayload } from '../../shared/state/keysignPayload';

export const useKeysignMsgsQuery = () => {
  const walletCore = useAssertWalletCore();

  const payload = useKeysignPayload();

  return useQuery({
    queryKey: ['keysignMsgs', payload],
    queryFn: () => {
      const { coin } = payload;
      if (!coin) {
        return [];
      }

      // TODO: this is breaking all the transactions
      // @Radzon should review it.
      // const result: string[] = [];

      // if ('erc20ApprovePayload' in payload) {
      //   result.push(
      //     getErc20ApprovePreSignedImageHash({
      //       keysignPayload: payload,
      //       walletCore,
      //     })
      //   );
      // }

      const service = BlockchainServiceFactory.createService(
        coin.chain as Chain,
        walletCore!
      );

      console.log('useKeysignMsgsQuery service:', service);

      return service.getPreSignedImageHash(payload);
    },
    meta: {
      disablePersist: true,
    },
  });
};
