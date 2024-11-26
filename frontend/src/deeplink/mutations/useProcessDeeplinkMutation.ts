import { useMutation } from '@tanstack/react-query';

import { match } from '../../lib/utils/match';
import { getRawQueryParams } from '../../lib/utils/query/getRawQueryParams';
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate';
import { keygenMsgRecord, KeygenType } from '../../vault/keygen/KeygenType';
import { parseTransferredKeysignMsg } from '../../vault/keysign/shared/utils/parseTransfferedKeysignMsg';
import { decompressQrPayload } from '../../vault/qr/upload/utils/decompressQrPayload';

type DeeplinkType = 'NewVault' | 'SignTransaction';

type DeeplinkSharedData = {
  jsonData: string;
  vault: string;
};

type DeeplinkParams = DeeplinkSharedData & {
  type: DeeplinkType;
} & {
  tssType: KeygenType;
} & {
  vault: string;
};

export const useProcessDeeplinkMutation = () => {
  const navigate = useAppNavigate();

  return useMutation({
    mutationFn: async (url: string) => {
      const queryParams = getRawQueryParams<DeeplinkParams>(url);
      const { jsonData } = queryParams;
      const payload = await decompressQrPayload(jsonData);

      if ('type' in queryParams) {
        return match(queryParams.type, {
          NewVault: async () => {
            const keygenType = queryParams.tssType;

            const { fromBinary } = keygenMsgRecord[keygenType];

            const keygenMsg = fromBinary(payload);

            navigate('joinKeygen', {
              state: {
                keygenType,
                keygenMsg,
              },
            });
          },
          SignTransaction: async () => {
            const vaultId = queryParams.vault;

            const keysignMsg = await parseTransferredKeysignMsg(payload);

            navigate('joinKeysign', {
              state: {
                keysignMsg,
                vaultId,
              },
            });
          },
        });
      }

      throw new Error(`Unknown deeplink: ${url}`);
    },
  });
};
